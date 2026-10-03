import { 
  AuditLedgerEntry, 
  Parcel, 
  ParcelRiskFlag, 
  ServiceRequest, 
  ServiceRequestStatus, 
  ServiceRequestType, 
  UserPersona, 
  UserRole, 
  WaterbodyRecord, 
  WorkflowTransition 
} from '../../shared/types';

class ApiClient {
  private token: string | null = null;
  private tokenStorageKey = 'kshetra_jwt_token';

  constructor() {
    this.token = localStorage.getItem(this.tokenStorageKey);
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(this.tokenStorageKey, token);
    } else {
      localStorage.removeItem(this.tokenStorageKey);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || `HTTP error ${response.status}`);
    }

    return data;
  }

  // Auth Endpoints
  public async login(role: UserRole): Promise<{ token: string; user: UserPersona }> {
    const res = await this.request<{ token: string; user: UserPersona }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    this.setToken(res.token);
    return res;
  }

  public async requestOtp(aadhaarNumber: string): Promise<{ demoOtp: string; message: string }> {
    return this.request('/api/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ aadhaarNumber })
    });
  }

  public async verifyOtp(aadhaarNumber: string, otp: string): Promise<{ token: string; user: UserPersona }> {
    const res = await this.request<{ token: string; user: UserPersona }>('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ aadhaarNumber, otp })
    });
    this.setToken(res.token);
    return res;
  }

  public async ssoLogin(officerBadgeId: string, role: UserRole = 'officer'): Promise<{ token: string; user: UserPersona }> {
    const res = await this.request<{ token: string; user: UserPersona }>('/api/auth/sso', {
      method: 'POST',
      body: JSON.stringify({ officerBadgeId, role })
    });
    this.setToken(res.token);
    return res;
  }

  public async getCurrentUser(): Promise<UserPersona | null> {
    if (!this.token) return null;
    try {
      const res = await this.request<{ user: UserPersona }>('/api/auth/me');
      return res.user;
    } catch {
      this.setToken(null);
      return null;
    }
  }

  public logout(): void {
    this.setToken(null);
  }

  // Parcels & Layers
  public async getParcels(filter?: {
    q?: string;
    city?: string;
    disputed?: boolean;
    flagged?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ items: Parcel[]; total: number }> {
    const params = new URLSearchParams();
    if (filter?.q) params.set('q', filter.q);
    if (filter?.city && filter.city !== 'All India') params.set('city', filter.city);
    if (filter?.disputed !== undefined) params.set('disputed', String(filter.disputed));
    if (filter?.flagged !== undefined) params.set('flagged', String(filter.flagged));
    if (filter?.page) params.set('page', String(filter.page));
    if (filter?.limit) params.set('limit', String(filter.limit));

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<{ data: Parcel[]; total: number }>(`/api/parcels${queryStr}`);
    return { items: res.data, total: res.total };
  }

  public async getParcel(ulpin: string): Promise<Parcel> {
    const res = await this.request<{ data: Parcel }>(`/api/parcels/${encodeURIComponent(ulpin)}`);
    return res.data;
  }

  public async getParcelRisks(ulpin: string): Promise<ParcelRiskFlag[]> {
    const res = await this.request<{ flags: ParcelRiskFlag[] }>(`/api/parcels/${encodeURIComponent(ulpin)}/risks`);
    return res.flags;
  }

  public async fetchParcelAsRole(ulpin: string, role: UserRole): Promise<{ status: number; data: any }> {
    const loginRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const { token } = await loginRes.json();
    const parcelRes = await fetch(`/api/parcels/${encodeURIComponent(ulpin)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await parcelRes.json();
    return {
      status: parcelRes.status,
      data
    };
  }

  public async getWaterbodies(): Promise<WaterbodyRecord[]> {
    const res = await this.request<{ data: WaterbodyRecord[] }>('/api/layers/waterbodies');
    return res.data;
  }

  // Requests
  public async getRequests(): Promise<ServiceRequest[]> {
    const res = await this.request<{ data: ServiceRequest[] }>('/api/requests');
    return res.data;
  }

  public async createRequest(data: {
    parcelUlpin: string;
    applicantName: string;
    applicantAadhaarMasked: string;
    requestType: ServiceRequestType;
    urgency: 'Normal' | 'Tatkal';
    supportingDocName?: string;
  }): Promise<ServiceRequest> {
    const res = await this.request<{ data: ServiceRequest }>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  public async transitionRequest(
    id: string,
    nextStatus: ServiceRequestStatus,
    department: WorkflowTransition['department'],
    remarks: string
  ): Promise<ServiceRequest> {
    const res = await this.request<{ data: ServiceRequest }>(`/api/requests/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ nextStatus, department, remarks })
    });
    return res.data;
  }

  // Ledger
  public async getLedger(): Promise<AuditLedgerEntry[]> {
    const res = await this.request<{ data: AuditLedgerEntry[] }>('/api/ledger');
    return res.data;
  }

  public async verifyLedger(): Promise<{ isValid: boolean; verifiedBlocks: number; brokenBlockIndex?: number; errorReason?: string; timestamp: string }> {
    const res = await this.request<{ result: any }>('/api/ledger/verify', { method: 'POST' });
    return res.result;
  }

  public async tamperLedger(): Promise<{ message: string; tamperedBlockIndex: number }> {
    return this.request('/api/ledger/tamper', { method: 'POST' });
  }

  public async resetLedger(): Promise<{ message: string }> {
    return this.request('/api/ledger/reset', { method: 'POST' });
  }

  // Stage 2 Document & Dossier Operations
  public async uploadDocument(file: File, parcelUlpin?: string): Promise<{ success: boolean; message: string; data: any }> {
    const formData = new FormData();
    formData.append('file', file);
    if (parcelUlpin) formData.append('parcelUlpin', parcelUlpin);

    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'Document upload failed');
    return data;
  }

  public async downloadDossierPdf(ulpin: string): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(`/api/dossier/${encodeURIComponent(ulpin)}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) throw new Error(`Failed to generate dossier PDF (${res.status})`);
    return res.blob();
  }

  public async verifyDossierPdf(file: File): Promise<{ matched: boolean; status: 'MATCH' | 'NO_MATCH'; calculatedHash: string; block?: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch('/api/dossier/verify', {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'Dossier verification failed');
    return data;
  }

  public async exportLedgerJson(): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch('/api/ledger/export', {
      headers
    });
    if (!res.ok) throw new Error(`Failed to export ledger (${res.status})`);
    return res.blob();
  }
}

export const apiClient = new ApiClient();
