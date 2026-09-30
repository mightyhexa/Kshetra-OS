/**
 * Land Stack (SIH26014) - Core Data Types & Schemas
 * An Integrated GIS-based Digital Public Infrastructure for Land Governance
 */

export type UserRole = 'citizen' | 'officer' | 'policy_admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  aadhaarMasked: string; // e.g. "XXXX-XXXX-9182"
  designation?: string;
  department?: string;
  jurisdictionState: string;
  jurisdictionDistrict: string;
  officerBadgeId?: string;
  createdAt: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  avatarSeed: string;
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // [ [lon, lat], ... ]
}

export interface OwnershipRecord {
  parcelUlpin: string;
  ownerName: string;
  coOwners?: string[];
  ownershipType: 'Freehold' | 'Leasehold' | 'Government' | 'Joint Ownership';
  registrationDate: string;
  registrationStatus: 'Registered' | 'Pending Verification' | 'Under Objection';
  documentNumber: string;
  subRegistrarOffice: string;
}

export interface ZoningRecord {
  parcelUlpin: string;
  masterPlanClassification: 'Residential' | 'Commercial' | 'Agricultural' | 'Industrial' | 'Public Utility' | 'Eco-Sensitive';
  registeredLandUse: 'Residential' | 'Commercial' | 'Agricultural' | 'Industrial' | 'Public Utility' | 'Eco-Sensitive';
  buildingPermissionStatus: 'Approved' | 'In Review' | 'Not Permitted' | 'Violation Notice Issued';
  floorAreaRatioAllowed: number;
  maxBuildingHeightMeters: number;
}

export interface EncumbranceRecord {
  parcelUlpin: string;
  hasMortgage: boolean;
  // Sensitive fields: ONLY visible to officer & policy_admin
  mortgageDetails?: {
    lenderName: string;
    loanAmountInr: number;
    sanctionDate: string;
    chargeId: string;
  };
  disputeFlag: boolean;
  disputeReason?: string;
  courtCaseNumber?: string;
  stayOrderActive?: boolean;
}

export interface TaxRecord {
  parcelUlpin: string;
  taxStatus: 'Paid' | 'Outstanding' | 'Exempt';
  lastAssessedValueInr: number;
  annualTaxDemandInr: number;
  lastPaymentDate?: string;
  propertyTaxAssessmentNo: string;
}

export interface UtilityRecord {
  parcelUlpin: string;
  electricityConsumerId: string;
  electricityDiscom: string;
  waterSupplyConnectionId: string;
  pipelineGasStatus: 'Connected' | 'Available' | 'Not Available';
  roadAccessWidthMeters: number;
}

export interface Parcel {
  ulpin: string; // Unique Land Parcel Identification Number (14-digit Bhu-Aadhaar format)
  surveyNumber: string;
  centroidLat: number;
  centroidLon: number;
  areaSqm: number;
  areaAcres: number;
  boundaryGeojson: GeoJsonPolygon;
  state: string;
  district: string;
  subDistrictTaluk: string;
  villageWard: string;
  pincode: string;
  isMock: true; // Standard requirement: always true for mock prototype
  
  // Tiers
  ownership: OwnershipRecord;
  zoning: ZoningRecord;
  encumbrance: EncumbranceRecord;
  tax: TaxRecord;
  utilities: UtilityRecord;
}

export type ParcelDetailTier = 'base' | 'essential' | 'additional';

export interface ParcelRiskFlag {
  code: 'DISPUTE_ACTIVE' | 'ZONING_MISMATCH' | 'STALE_REGISTRATION' | 'TAX_DEFAULT' | 'BUILDING_VIOLATION';
  severity: 'high' | 'medium' | 'low';
  title: string;
  reason: string;
  triggeredFields: string[];
}

export type ServiceRequestType = 
  | 'MUTATION_OF_TITLE'
  | 'ENCUMBRANCE_CERTIFICATE'
  | 'BOUNDARY_DEMARCATION'
  | 'LAND_CONVERSION_CLU'
  | 'TAX_RECORD_RECTIFICATION';

export type ServiceRequestStatus = 
  | 'SUBMITTED'
  | 'UNDER_DEPARTMENTAL_REVIEW'
  | 'CROSS_VERIFIED'
  | 'APPROVED'
  | 'REJECTED';

export interface WorkflowTransition {
  id: string;
  fromStatus: ServiceRequestStatus | null;
  toStatus: ServiceRequestStatus;
  department: 'Land Records & Survey' | 'Sub-Registrar (Stamps)' | 'Town Planning (GIS)' | 'Revenue & Fiscal' | 'Applicant';
  actionedByRole: UserRole;
  actionedByName: string;
  timestamp: string;
  remarks: string;
}

export interface ServiceRequest {
  id: string;
  parcelUlpin: string;
  applicantName: string;
  applicantAadhaarMasked: string;
  requestType: ServiceRequestType;
  status: ServiceRequestStatus;
  submittedAt: string;
  lastUpdatedAt: string;
  urgency: 'Normal' | 'Tatkal';
  supportingDocName: string;
  history: WorkflowTransition[];
}

export interface AuditLedgerEntry {
  blockIndex: number;
  timestamp: string;
  action: 'PARCEL_SEARCH' | 'PARCEL_VIEW' | 'SERVICE_REQUEST_SUBMIT' | 'WORKFLOW_TRANSITION' | 'PROFILE_UPDATE' | 'ROLE_SWITCH';
  actorRole: UserRole;
  actorName: string;
  actorId: string;
  parcelUlpin?: string;
  details: string;
  metadataPayload: Record<string, unknown>;
  previousHash: string;
  currentHash: string; // SHA-256 cryptographic hash of block contents
}

export interface AdminAnalyticsSummary {
  totalParcelsIndexed: number;
  totalStatesCovered: number;
  totalDistrictsCovered: number;
  activeDisputeCount: number;
  flaggedParcelsCount: number;
  totalServiceRequests: number;
  pendingReviewCount: number;
  crossVerifiedCount: number;
  approvedCount: number;
  rejectedCount: number;
  averageTurnaroundDays: number;
  auditLedgerBlockCount: number;
}
