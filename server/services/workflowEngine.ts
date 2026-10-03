import { 
  ServiceRequest, 
  ServiceRequestStatus, 
  StandardWorkflowStatus, 
  UserRole, 
  WorkflowTransition 
} from '../../shared/types';
import { repository } from '../repo';
import { appendLedgerEntry } from './ledgerService';
import { eventBroadcaster } from './eventBroadcaster';

export const VALID_SERVICE_TYPES = [
  'Mutation of Title',
  'Encumbrance Certificate',
  'Change of Land Use',
  'Partition Survey',
  'Form 15 Certificate'
] as const;

export type StandardServiceType = typeof VALID_SERVICE_TYPES[number];

// Normalized state machine transitions mapping
const ALLOWED_TRANSITIONS: Record<string, { next: string[]; allowedRoles: UserRole[] }> = {
  'Applied': {
    next: ['Under Review'],
    allowedRoles: ['officer', 'policy_admin']
  },
  'SUBMITTED': { // Backward compatibility alias for Applied
    next: ['Under Review', 'UNDER_DEPARTMENTAL_REVIEW'],
    allowedRoles: ['officer', 'policy_admin']
  },
  'Under Review': {
    next: ['Cross Verified', 'Rejected'],
    allowedRoles: ['officer', 'policy_admin']
  },
  'UNDER_DEPARTMENTAL_REVIEW': {
    next: ['Cross Verified', 'CROSS_VERIFIED', 'Rejected', 'REJECTED'],
    allowedRoles: ['officer', 'policy_admin']
  },
  'Cross Verified': {
    next: ['Approved', 'Rejected'],
    allowedRoles: ['officer', 'policy_admin']
  },
  'CROSS_VERIFIED': {
    next: ['Approved', 'APPROVED', 'Rejected', 'REJECTED'],
    allowedRoles: ['officer', 'policy_admin']
  },
  'Approved': {
    next: [],
    allowedRoles: []
  },
  'APPROVED': {
    next: [],
    allowedRoles: []
  },
  'Rejected': {
    next: [],
    allowedRoles: []
  },
  'REJECTED': {
    next: [],
    allowedRoles: []
  }
};

export class WorkflowTransitionError extends Error {
  public statusCode: number;
  public details: unknown;
  constructor(message: string, statusCode = 409, details?: unknown) {
    super(message);
    this.name = 'WorkflowTransitionError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Validates whether a state transition is legal for the current role
 */
export function validateTransition(
  currentStatus: string,
  targetStatus: string,
  userRole: UserRole
): void {
  const rule = ALLOWED_TRANSITIONS[currentStatus];

  if (!rule) {
    throw new WorkflowTransitionError(
      `Invalid current request status: "${currentStatus}".`,
      409
    );
  }

  if (rule.next.length === 0) {
    throw new WorkflowTransitionError(
      `Terminal state reached: Request is already "${currentStatus}" and cannot be transitioned further.`,
      409
    );
  }

  if (!rule.allowedRoles.includes(userRole)) {
    throw new WorkflowTransitionError(
      `Role "${userRole}" is unauthorized to authorize workflow transitions. Officer or Policy Admin credentials required.`,
      403
    );
  }

  // Check normalized target status
  const normalizedTarget = targetStatus.replace(/_/g, ' ').toLowerCase();
  const isMatch = rule.next.some(s => s.replace(/_/g, ' ').toLowerCase() === normalizedTarget);

  if (!isMatch) {
    throw new WorkflowTransitionError(
      `Illegal state transition from "${currentStatus}" to "${targetStatus}". Allowed next states: ${rule.next.join(', ')}.`,
      409,
      { currentStatus, targetStatus, allowedNext: rule.next }
    );
  }
}

/**
 * Calculates turnaround duration in hours / days
 */
export function calculateTurnaround(submittedAt: string, completedAt?: string): {
  durationHours: number;
  durationDays: number;
  slaCompliant: boolean; // Standard SLA is 7 days
} {
  const start = new Date(submittedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);
  const durationHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1));
  const durationDays = parseFloat((durationHours / 24).toFixed(1));

  return {
    durationHours,
    durationDays,
    slaCompliant: durationDays <= 7.0
  };
}

/**
 * Executes a verified workflow transition, appends history, writes to DB and ledger
 */
export async function transitionServiceRequest(params: {
  requestId: string;
  nextStatus: string;
  department: WorkflowTransition['department'];
  remarks: string;
  actor: {
    id: string;
    role: UserRole;
    fullName: string;
  };
}): Promise<ServiceRequest> {
  const request = await repository.getServiceRequestById(params.requestId);

  if (!request) {
    throw new WorkflowTransitionError(`Service request not found: ${params.requestId}`, 404);
  }

  if (!params.remarks || params.remarks.trim().length === 0) {
    throw new WorkflowTransitionError('A non-empty official remark is required for statutory workflow transition.', 400);
  }

  if (!params.department) {
    throw new WorkflowTransitionError('Acting government department must be specified for transition.', 400);
  }

  // Enforce state machine rules
  validateTransition(request.status, params.nextStatus, params.actor.role);

  const now = new Date().toISOString();
  const transitionEntry: WorkflowTransition = {
    id: `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fromStatus: request.status,
    toStatus: params.nextStatus as ServiceRequestStatus,
    department: params.department,
    actionedByRole: params.actor.role,
    actionedByName: params.actor.fullName,
    timestamp: now,
    remarks: params.remarks.trim()
  };

  request.status = params.nextStatus as ServiceRequestStatus;
  request.lastUpdatedAt = now;
  request.history.push(transitionEntry);

  await repository.saveServiceRequest(request);

  // Write immutable audit ledger block
  await appendLedgerEntry({
    action: 'REQUEST_TRANSITION',
    actorRole: params.actor.role,
    actorName: params.actor.fullName,
    actorId: params.actor.id,
    ulpin: request.parcelUlpin,
    detail: `Service Request ${request.id} transitioned from ${transitionEntry.fromStatus} to ${transitionEntry.toStatus} by ${params.actor.fullName} (${params.department}).`,
    payload: {
      requestId: request.id,
      fromStatus: transitionEntry.fromStatus,
      toStatus: transitionEntry.toStatus,
      department: params.department,
      remarks: params.remarks
    }
  });

  // Broadcast event via SSE
  eventBroadcaster.broadcast('REQUEST_STATUS', {
    requestId: request.id,
    fromStatus: transitionEntry.fromStatus,
    toStatus: transitionEntry.toStatus,
    department: params.department,
    updatedAt: now
  });

  return request;
}
