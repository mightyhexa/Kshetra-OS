export type UserRole = 'citizen' | 'officer' | 'policy_admin';

export interface UserPersona {
  id: string;
  fullName: string;
  role: UserRole;
  designation?: string;
  jurisdictionDistrict?: string;
  jurisdictionState?: string;
  aadhaarMasked?: string;
  officerBadgeId?: string;
  email?: string;
  phone?: string;
  twoFactorEnabled?: boolean;
}

export interface OwnershipRecord {
  parcelUlpin: string;
  ownerName: string;
  ownerGender?: 'Male' | 'Female' | 'Joint' | 'Entity';
  ownershipType: 'Private Individual' | 'Joint Family' | 'Corporate' | 'Government';
  registrationDate: string;
  registrationNumber: string;
  subRegistrarOffice: string;
  stampDutyPaidInr: number;
  marketValuationInr: number;
  coOwners?: string[];
  documentNumber?: string;
  registrationStatus?: 'Registered & Mutated' | 'Pending Mutation';
}

export interface MortgageDetails {
  lenderName: string;
  loanAmountInr: number;
  sanctionDate: string;
  chargeId: string;
  chargeStatus: 'Active' | 'Discharged';
}

export interface EncumbranceRecord {
  parcelUlpin: string;
  hasMortgage: boolean;
  disputeFlag: boolean;
  stayOrderActive?: boolean;
  stayOrderDetails?: string;
  courtCaseNumber?: string;
  disputeReason?: string;
  mortgageDetails?: MortgageDetails;
}

export interface ZoningRecord {
  parcelUlpin: string;
  masterPlanClassification: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural' | 'Public Utility' | 'Ecological Buffer';
  registeredLandUse: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural' | 'Public Utility' | 'Ecological Buffer';
  floorAreaRatioAllowed: number;
  floorAreaRatioUtilized: number;
  buildingPermissionStatus: 'Approved' | 'Violation Notice Issued' | 'Pending Review' | 'Exempt';
  maxBuildingHeightMeters?: number;
}

export interface TaxRecord {
  parcelUlpin: string;
  propertyTaxAssessmentNo: string;
  annualTaxDemandInr: number;
  taxStatus: 'Paid' | 'Outstanding';
  lastPaymentDate?: string;
  assessmentYear: number;
  lastAssessedValueInr?: number;
  waterConnectionId?: string;
  electricityConsumerNo?: string;
}

export interface SroDeedRecord {
  deedId: string;
  parcelUlpin: string;
  deedType: 'SALE_DEED' | 'GIFT_DEED' | 'PARTITION_DEED' | 'MORTGAGE_DEED';
  buyerName: string;
  sellerName: string;
  registrationDate: string;
  considerationAmountInr: number;
  sroCode: string;
}

export interface CersaiChargeRecord {
  chargeId: string;
  parcelUlpin: string;
  financialInstitution: string;
  assetType: 'IMMOVABLE_PROPERTY';
  sanctionAmountInr: number;
  chargeCreationDate: string;
  status: 'ACTIVE' | 'SATISFIED';
}

export interface WaterbodyRecord {
  id: string;
  name: string;
  type: 'Lake' | 'Stormwater Drain' | 'River Stream' | 'Wetland Buffer';
  district: string;
  state: string;
  bufferDistanceMeters: number;
  boundaryGeojson: GeoJSON.Polygon;
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface ParcelUtilities {
  electricityConnection: boolean;
  waterConnection: boolean;
  sewerConnection: boolean;
  roadAccessType: string;
  nearestNationalHighwayKm: number;
}

export interface Parcel {
  ulpin: string; // 14 characters
  displayUlpin: string; // XX-XXXX-XXXX-XXXX
  surveyNumber: string;
  centroidLat: number;
  centroidLon: number;
  areaSqm: number;
  areaAcres: number;
  state: string;
  stateCode: string;
  district: string;
  subDistrict: string;
  subDistrictTaluk?: string;
  villageWard: string;
  pinCode: string;
  pincode?: string;
  boundaryGeojson: GeoJsonPolygon;
  ownership: OwnershipRecord;
  zoning: ZoningRecord;
  encumbrance: EncumbranceRecord;
  tax: TaxRecord;
  sroDeeds?: SroDeedRecord[];
  cersaiCharges?: CersaiChargeRecord[];
  utilities?: ParcelUtilities;
}

export interface ParcelRiskFlag {
  code: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  reason: string;
  ruleId: string;
  triggeredFields: string[];
  responsibleOffice: string;
}

export type ServiceRequestType = 
  | 'MUTATION_OF_TITLE'
  | 'ENCUMBRANCE_CERTIFICATE'
  | 'CADASTRAL_DEMARCATION'
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
  department: 'Applicant' | 'Land Records & Survey' | 'Sub-Registrar (Stamps)' | 'Municipal Revenue' | 'Judicial Court' | 'Town Planning (GIS)' | 'Revenue & Fiscal';
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
  supportingDocName?: string;
  history: WorkflowTransition[];
}

export type RiskSeverity = 'info' | 'amber' | 'rose';

export interface RiskRuleFinding {
  ruleId: string;
  severity: RiskSeverity;
  plainReason: string;
  params: Record<string, unknown>;
  triggerFields: string[];
  responsibleOffice: string;
  evidence: unknown;
}

export type LedgerAction =
  | 'LOGIN'
  | 'ROLE_SWITCH'
  | 'PARCEL_SEARCH'
  | 'PARCEL_VIEW'
  | 'REQUEST_SUBMITTED'
  | 'REQUEST_TRANSITION'
  | 'DOCUMENT_UPLOADED'
  | 'DOSSIER_ISSUED';

export interface LedgerBlock {
  index: number;
  timestamp: string;
  action: LedgerAction;
  actorId: string;
  actorRole: UserRole;
  ulpin?: string;
  detail: string;
  payloadHash: string;
  previousHash: string;
  hash: string;
}

export type StandardWorkflowStatus =
  | 'Applied'
  | 'Under Review'
  | 'Cross Verified'
  | 'Approved'
  | 'Rejected';

export interface DocumentRecord {
  id: string;
  parcelUlpin?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  uploadedBy: string;
  uploadedRole: UserRole;
  uploadedAt: string;
  filepath: string;
}

export interface AuditLedgerEntry {
  blockIndex: number;
  timestamp: string;
  action: LedgerAction | 'ROLE_SWITCH' | 'PARCEL_VIEW' | 'PARCEL_SEARCH' | 'SERVICE_REQUEST_SUBMIT' | 'WORKFLOW_TRANSITION' | 'SUBDIVISION_DEMARCATION';
  actorRole: UserRole;
  actorName: string;
  actorId: string;
  parcelUlpin?: string;
  details: string;
  metadataPayload: Record<string, unknown>;
  previousHash: string;
  currentHash: string;
}
