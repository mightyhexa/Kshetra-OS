import { ServiceRequest, ServiceRequestStatus, ServiceRequestType, UserRole, WorkflowTransition } from '../types';
import { auditLedger } from './auditLedger';

/**
 * Layer 4: Cross-System Interoperable Workflow Simulation
 * Simulates real-time multi-departmental verification across:
 * - Land Records & Survey (Bhoomi / AnyRoR / Dharani equivalent)
 * - Sub-Registrar Office (Inspector General of Registration & Stamps)
 * - Town Planning & Municipal GIS (Development Authorities)
 * - Revenue & Fiscal (Municipal Property Tax)
 */

class WorkflowEngine {
  private requests: Map<string, ServiceRequest> = new Map();

  constructor() {
    this.seedInitialRequests();
  }

  private seedInitialRequests() {
    const seed1: ServiceRequest = {
      id: 'REQ-2024-8801',
      parcelUlpin: 'KA-BLR-2024-009182',
      applicantName: 'Venkata Ramanappa Gowda',
      applicantAadhaarMasked: 'XXXX-XXXX-9182',
      requestType: 'MUTATION_OF_TITLE',
      status: 'CROSS_VERIFIED',
      submittedAt: '2024-06-01T10:30:00.000Z',
      lastUpdatedAt: '2024-06-04T16:15:00.000Z',
      urgency: 'Normal',
      supportingDocName: 'Registered_SaleDeed_8891.pdf',
      history: [
        {
          id: 'TR-01',
          fromStatus: null,
          toStatus: 'SUBMITTED',
          department: 'Applicant',
          actionedByRole: 'citizen',
          actionedByName: 'Venkata Ramanappa Gowda',
          timestamp: '2024-06-01T10:30:00.000Z',
          remarks: 'Application submitted along with registered sale deed copy and mutation fee ₹500.'
        },
        {
          id: 'TR-02',
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          department: 'Land Records & Survey',
          actionedByRole: 'officer',
          actionedByName: 'K. Ramesh (Tahsildar Bengaluru East)',
          timestamp: '2024-06-02T14:20:00.000Z',
          remarks: 'Survey bounds verified against Village Cadastral Map Sheet 142.'
        },
        {
          id: 'TR-03',
          fromStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          toStatus: 'CROSS_VERIFIED',
          department: 'Sub-Registrar (Stamps)',
          actionedByRole: 'officer',
          actionedByName: 'SRO Shivajinagar Verification Node',
          timestamp: '2024-06-04T16:15:00.000Z',
          remarks: 'E-Stamps authenticity confirmed; Revenue dues clear (BBMP SAS Clearance 2024).'
        }
      ]
    };

    const seed2: ServiceRequest = {
      id: 'REQ-2024-9122',
      parcelUlpin: 'TS-HYD-2024-101183',
      applicantName: 'Venkata Satyanarayana Raju',
      applicantAadhaarMasked: 'XXXX-XXXX-3819',
      requestType: 'ENCUMBRANCE_CERTIFICATE',
      status: 'APPROVED',
      submittedAt: '2024-05-18T09:15:00.000Z',
      lastUpdatedAt: '2024-05-20T11:45:00.000Z',
      urgency: 'Tatkal',
      supportingDocName: 'Form_22_EC_Application.pdf',
      history: [
        {
          id: 'TR-11',
          fromStatus: null,
          toStatus: 'SUBMITTED',
          department: 'Applicant',
          actionedByRole: 'citizen',
          actionedByName: 'Venkata Satyanarayana Raju',
          timestamp: '2024-05-18T09:15:00.000Z',
          remarks: 'Tatkal request for 30-year Encumbrance Certificate (1994-2024).'
        },
        {
          id: 'TR-12',
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          department: 'Sub-Registrar (Stamps)',
          actionedByRole: 'officer',
          actionedByName: 'Sub-Registrar Serilingampally',
          timestamp: '2024-05-19T11:00:00.000Z',
          remarks: 'Registry book search initiated for Survey 64/3.'
        },
        {
          id: 'TR-13',
          fromStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          toStatus: 'CROSS_VERIFIED',
          department: 'Land Records & Survey',
          actionedByRole: 'officer',
          actionedByName: 'Revenue Divisional Officer Serilingampally',
          timestamp: '2024-05-20T10:10:00.000Z',
          remarks: 'Title free of government ceiling or Wakf encumbrance.'
        },
        {
          id: 'TR-14',
          fromStatus: 'CROSS_VERIFIED',
          toStatus: 'APPROVED',
          department: 'Sub-Registrar (Stamps)',
          actionedByRole: 'officer',
          actionedByName: 'Joint Registrar Cyberabad',
          timestamp: '2024-05-20T11:45:00.000Z',
          remarks: 'Digitally signed Form 15 Encumbrance Certificate generated and dispatched.'
        }
      ]
    };

    const seed3: ServiceRequest = {
      id: 'REQ-2024-9404',
      parcelUlpin: 'KA-BLR-2024-014299',
      applicantName: 'Apex Infra Realty LLP',
      applicantAadhaarMasked: 'XXXX-XXXX-4412',
      requestType: 'LAND_CONVERSION_CLU',
      status: 'UNDER_DEPARTMENTAL_REVIEW',
      submittedAt: '2024-06-10T11:00:00.000Z',
      lastUpdatedAt: '2024-06-12T15:30:00.000Z',
      urgency: 'Normal',
      supportingDocName: 'CLU_Industrial_To_Commercial_Petition.pdf',
      history: [
        {
          id: 'TR-21',
          fromStatus: null,
          toStatus: 'SUBMITTED',
          department: 'Applicant',
          actionedByRole: 'citizen',
          actionedByName: 'Apex Infra Realty Rep',
          timestamp: '2024-06-10T11:00:00.000Z',
          remarks: 'Applied for Change of Land Use (CLU) from Industrial to Commercial High Density.'
        },
        {
          id: 'TR-22',
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          department: 'Town Planning (GIS)',
          actionedByRole: 'officer',
          actionedByName: 'BDA Town Planning Directorate',
          timestamp: '2024-06-12T15:30:00.000Z',
          remarks: 'Flagged: Parcel is in storm-water buffer zone (Rajakaluve). Objection notified.'
        }
      ]
    };

    this.requests.set(seed1.id, seed1);
    this.requests.set(seed2.id, seed2);
    this.requests.set(seed3.id, seed3);
  }

  public getAllRequests(): ServiceRequest[] {
    return Array.from(this.requests.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  public getRequestById(id: string): ServiceRequest | undefined {
    return this.requests.get(id);
  }

  public getRequestsForParcel(ulpin: string): ServiceRequest[] {
    return this.getAllRequests().filter(r => r.parcelUlpin === ulpin);
  }

  /**
   * Submit a new service request from Citizen View
   */
  public async submitRequest(params: {
    parcelUlpin: string;
    applicantName: string;
    applicantAadhaarMasked: string;
    requestType: ServiceRequestType;
    urgency: 'Normal' | 'Tatkal';
    supportingDocName?: string;
    actorRole: UserRole;
    actorId: string;
  }): Promise<ServiceRequest> {
    const nextSeq = this.requests.size + 1;
    const id = `REQ-2024-${String(nextSeq).padStart(4, '0')}`;
    const timestamp = new Date().toISOString();

    const transition: WorkflowTransition = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      fromStatus: null,
      toStatus: 'SUBMITTED',
      department: 'Applicant',
      actionedByRole: params.actorRole,
      actionedByName: params.applicantName,
      timestamp,
      remarks: `Submitted ${params.requestType.replace(/_/g, ' ')} via Citizen Service Portal.`
    };

    const newRequest: ServiceRequest = {
      id,
      parcelUlpin: params.parcelUlpin,
      applicantName: params.applicantName,
      applicantAadhaarMasked: params.applicantAadhaarMasked,
      requestType: params.requestType,
      status: 'SUBMITTED',
      submittedAt: timestamp,
      lastUpdatedAt: timestamp,
      urgency: params.urgency,
      supportingDocName: params.supportingDocName || 'Application_Declaration.pdf',
      history: [transition]
    };

    this.requests.set(id, newRequest);

    // Append to immutable audit ledger
    await auditLedger.appendEntry({
      action: 'SERVICE_REQUEST_SUBMIT',
      actorRole: params.actorRole,
      actorName: params.applicantName,
      actorId: params.actorId,
      parcelUlpin: params.parcelUlpin,
      details: `New ${params.requestType} application [${id}] submitted for parcel ${params.parcelUlpin}`,
      metadataPayload: { requestId: id, requestType: params.requestType, urgency: params.urgency }
    });

    return newRequest;
  }

  /**
   * Advance a service request state (Land Officer or Policy Admin action)
   */
  public async transitionRequest(params: {
    requestId: string;
    nextStatus: ServiceRequestStatus;
    department: WorkflowTransition['department'];
    actorRole: UserRole;
    actorName: string;
    actorId: string;
    remarks: string;
  }): Promise<ServiceRequest> {
    const req = this.requests.get(params.requestId);
    if (!req) {
      throw new Error(`Service request ${params.requestId} not found.`);
    }

    const timestamp = new Date().toISOString();
    const transition: WorkflowTransition = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      fromStatus: req.status,
      toStatus: params.nextStatus,
      department: params.department,
      actionedByRole: params.actorRole,
      actionedByName: params.actorName,
      timestamp,
      remarks: params.remarks
    };

    req.status = params.nextStatus;
    req.lastUpdatedAt = timestamp;
    req.history.push(transition);
    this.requests.set(req.id, req);

    // Append to immutable audit ledger
    await auditLedger.appendEntry({
      action: 'WORKFLOW_TRANSITION',
      actorRole: params.actorRole,
      actorName: params.actorName,
      actorId: params.actorId,
      parcelUlpin: req.parcelUlpin,
      details: `Workflow [${req.id}] transitioned to ${params.nextStatus} by ${params.department}`,
      metadataPayload: {
        requestId: req.id,
        fromStatus: transition.fromStatus,
        toStatus: params.nextStatus,
        department: params.department,
        remarks: params.remarks
      }
    });

    return req;
  }
}

export const workflowEngine = new WorkflowEngine();
