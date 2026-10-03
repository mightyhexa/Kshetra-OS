import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { repository } from '../repo';
import { ServiceRequest, WorkflowTransition } from '../../shared/types';
import { 
  transitionServiceRequest, 
  WorkflowTransitionError, 
  calculateTurnaround,
  VALID_SERVICE_TYPES 
} from '../services/workflowEngine';
import { appendLedgerEntry } from '../services/ledgerService';
import { uploadMiddleware, ingestDocument } from '../services/documentService';

export const requestsRouter = Router();

// GET /api/requests
requestsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const requests = await repository.getServiceRequests();
  
  // Augment with SLA turnaround metrics
  const augmented = requests.map(r => {
    const isCompleted = r.status === 'APPROVED' || r.status === 'REJECTED' || r.status === 'Approved' || r.status === 'Rejected';
    const sla = calculateTurnaround(r.submittedAt, isCompleted ? r.lastUpdatedAt : undefined);
    return {
      ...r,
      turnaround: sla
    };
  });

  res.json({
    success: true,
    total: requests.length,
    data: augmented
  });
});

// GET /api/requests/:id
requestsRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await repository.getServiceRequestById(id);

  if (!request) {
    res.status(404).json({
      success: false,
      error: { code: 'REQUEST_NOT_FOUND', message: `No request found with ID: ${id}` }
    });
    return;
  }

  const isCompleted = request.status === 'APPROVED' || request.status === 'REJECTED' || request.status === 'Approved' || request.status === 'Rejected';
  const turnaround = calculateTurnaround(request.submittedAt, isCompleted ? request.lastUpdatedAt : undefined);

  res.json({
    success: true,
    data: {
      ...request,
      turnaround
    }
  });
});

// POST /api/requests (supports multipart with optional file or JSON)
requestsRouter.post('/', requireAuth, uploadMiddleware.single('file'), async (req: Request, res: Response) => {
  try {
    const parcelUlpin = (req.body.parcelUlpin || '').trim();
    const applicantName = (req.body.applicantName || req.user!.fullName).trim();
    const applicantAadhaarMasked = (req.body.applicantAadhaarMasked || req.user!.aadhaarMasked || 'XXXX-XXXX-9012').trim();
    const requestType = req.body.requestType || 'Mutation of Title';
    const urgency = req.body.urgency === 'Tatkal' ? 'Tatkal' : 'Normal';

    if (!parcelUlpin) {
      res.status(400).json({ success: false, error: { message: 'parcelUlpin is required' } });
      return;
    }

    const allReqs = await repository.getServiceRequests();
    const nextSeq = allReqs.length + 1;
    const requestId = `REQ-2026-${String(nextSeq).padStart(4, '0')}`;
    const now = new Date().toISOString();

    let uploadedDocName: string | undefined = undefined;

    // Ingest uploaded file if present
    if (req.file) {
      try {
        const doc = await ingestDocument({
          file: req.file,
          parcelUlpin,
          actor: {
            id: req.user!.id,
            role: req.user!.role,
            fullName: req.user!.fullName
          }
        });
        uploadedDocName = doc.originalName;
      } catch (err: any) {
        res.status(400).json({ success: false, error: { message: err.message || 'File ingestion failed' } });
        return;
      }
    }

    const initialTransition: WorkflowTransition = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      fromStatus: null,
      toStatus: 'Applied',
      department: 'Applicant',
      actionedByRole: req.user!.role,
      actionedByName: req.user!.fullName,
      timestamp: now,
      remarks: `Statutory application for "${requestType}" submitted online.`
    };

    const newRequest: ServiceRequest = {
      id: requestId,
      parcelUlpin,
      applicantName,
      applicantAadhaarMasked,
      requestType: requestType as any,
      status: 'Applied' as any,
      submittedAt: now,
      lastUpdatedAt: now,
      urgency,
      supportingDocName: uploadedDocName || req.body.supportingDocName || 'Application_Affidavit.pdf',
      history: [initialTransition]
    };

    await repository.saveServiceRequest(newRequest);

    // Append REQUEST_SUBMITTED block to persistent ledger
    await appendLedgerEntry({
      action: 'REQUEST_SUBMITTED',
      actorRole: req.user!.role,
      actorName: req.user!.fullName,
      actorId: req.user!.id,
      ulpin: parcelUlpin,
      detail: `Service Request ${requestId} (${requestType}) submitted for parcel ${parcelUlpin}.`,
      payload: {
        requestId,
        requestType,
        parcelUlpin,
        urgency,
        hasDocument: !!req.file
      }
    });

    res.status(201).json({
      success: true,
      data: newRequest
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Server error' } });
  }
});

// POST /api/requests/:id/transition (officer / admin state machine)
requestsRouter.post('/:id/transition', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nextStatus, department, remarks } = req.body;

  if (!nextStatus) {
    res.status(400).json({ success: false, error: { message: 'nextStatus is required' } });
    return;
  }

  try {
    const updated = await transitionServiceRequest({
      requestId: id,
      nextStatus,
      department: department || (req.user!.role === 'policy_admin' ? 'Town Planning (GIS)' : 'Land Records & Survey'),
      remarks: remarks || `Departmental transition to ${nextStatus} authorized by ${req.user!.fullName}.`,
      actor: {
        id: req.user!.id,
        role: req.user!.role,
        fullName: req.user!.fullName
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    if (err instanceof WorkflowTransitionError) {
      res.status(err.statusCode).json({
        success: false,
        error: {
          code: 'WORKFLOW_TRANSITION_FAILED',
          message: err.message,
          details: err.details
        }
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Workflow transition failed' }
    });
  }
});
