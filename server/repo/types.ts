import { 
  AuditLedgerEntry, 
  DocumentRecord,
  Parcel, 
  ServiceRequest, 
  UserPersona, 
  UserRole, 
  WaterbodyRecord 
} from '../../shared/types';

export interface ParcelFilter {
  q?: string;
  city?: string;
  disputed?: boolean;
  flagged?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Append-only Cadastral & DPI Repository Interface
 * Strictly prohibits UPDATE and DELETE operations on historical records and ledger blocks.
 */
export interface IRepository {
  init(): Promise<void>;
  getParcels(filter?: ParcelFilter): Promise<PaginatedResult<Parcel>>;
  getParcelByUlpin(ulpin: string): Promise<Parcel | null>;
  saveParcel(parcel: Parcel): Promise<void>;
  getWaterbodies(): Promise<WaterbodyRecord[]>;
  getUsers(): Promise<UserPersona[]>;
  getUserById(id: string): Promise<UserPersona | null>;
  getUserByRole(role: UserRole): Promise<UserPersona | null>;
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequestById(id: string): Promise<ServiceRequest | null>;
  saveServiceRequest(request: ServiceRequest): Promise<void>;
  getLedgerBlocks(): Promise<AuditLedgerEntry[]>;
  appendLedgerBlock(block: AuditLedgerEntry): Promise<void>;
  saveDocument(doc: DocumentRecord): Promise<void>;
  getDocumentById(id: string): Promise<DocumentRecord | null>;
  getDocumentsByParcel(ulpin: string): Promise<DocumentRecord[]>;
  resetToSeed(): Promise<void>;
}
