import fs from 'fs';
import path from 'path';
import { IRepository, PaginatedResult, ParcelFilter } from './types';
import { DatabaseState, buildSeedDatabase } from './seed';
import { config } from '../config';
import { 
  AuditLedgerEntry, 
  Parcel, 
  ServiceRequest, 
  UserPersona, 
  UserRole, 
  WaterbodyRecord 
} from '../../shared/types';
import { cleanUlpin } from '../../shared/ulpin';
import { evaluateParcelRisks } from '../services/riskEngine';

export class JsonFileRepository implements IRepository {
  private state: DatabaseState | null = null;
  private isWriting = false;

  public async init(): Promise<void> {
    try {
      const dir = path.dirname(config.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(config.dataPath)) {
        const raw = fs.readFileSync(config.dataPath, 'utf-8');
        this.state = JSON.parse(raw);
        // Verify minimum data integrity
        if (!this.state || !Array.isArray(this.state.parcels) || this.state.parcels.length !== 26) {
          console.warn('[DB] Existing store corrupted or incomplete. Reseeding 26 parcels...');
          await this.resetToSeed();
        }
      } else {
        console.log('[DB] First boot: Initializing fresh seed database...');
        await this.resetToSeed();
      }
    } catch (err) {
      console.error('[DB] Failed reading store, generating fresh seed in memory:', err);
      this.state = buildSeedDatabase();
      this.persist();
    }
  }

  private persist() {
    if (!this.state || this.isWriting) return;
    this.isWriting = true;
    try {
      const data = JSON.stringify(this.state, null, 2);
      fs.writeFileSync(config.dataPath, data, 'utf-8');
    } catch (err) {
      console.error('[DB] Persist error:', err);
    } finally {
      this.isWriting = false;
    }
  }

  public async getParcels(filter?: ParcelFilter): Promise<PaginatedResult<Parcel>> {
    if (!this.state) await this.init();
    let list = this.state!.parcels;

    if (filter) {
      if (filter.city && filter.city !== 'All India') {
        const c = filter.city.toLowerCase();
        list = list.filter(p => p.district.toLowerCase().includes(c) || p.state.toLowerCase().includes(c));
      }
      if (filter.disputed !== undefined) {
        list = list.filter(p => p.encumbrance.disputeFlag === filter.disputed);
      }
      if (filter.flagged) {
        list = list.filter(p => {
          const risks = evaluateParcelRisks(p, this.state!.parcels, this.state!.waterbodies);
          return risks.length > 0;
        });
      }
      if (filter.q) {
        const q = filter.q.toLowerCase().trim();
        const cleanQ = cleanUlpin(q);
        list = list.filter(p => {
          return (
            p.ulpin.toLowerCase().includes(q) ||
            cleanUlpin(p.ulpin).includes(cleanQ) ||
            p.surveyNumber.toLowerCase().includes(q) ||
            p.ownership.ownerName.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q) ||
            p.villageWard.toLowerCase().includes(q)
          );
        });
      }
    }

    const total = list.length;
    const page = filter?.page || 1;
    const limit = filter?.limit || 50;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  public async getParcelByUlpin(ulpin: string): Promise<Parcel | null> {
    if (!this.state) await this.init();
    const clean = cleanUlpin(ulpin);
    const found = this.state!.parcels.find(p => cleanUlpin(p.ulpin) === clean);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async saveParcel(parcel: Parcel): Promise<void> {
    if (!this.state) await this.init();
    const clean = cleanUlpin(parcel.ulpin);
    const idx = this.state!.parcels.findIndex(p => cleanUlpin(p.ulpin) === clean);
    if (idx >= 0) {
      this.state!.parcels[idx] = parcel;
    } else {
      this.state!.parcels.push(parcel);
    }
    this.persist();
  }

  public async getWaterbodies(): Promise<WaterbodyRecord[]> {
    if (!this.state) await this.init();
    return this.state!.waterbodies;
  }

  public async getUsers(): Promise<UserPersona[]> {
    if (!this.state) await this.init();
    return this.state!.users;
  }

  public async getUserById(id: string): Promise<UserPersona | null> {
    if (!this.state) await this.init();
    return this.state!.users.find(u => u.id === id) || null;
  }

  public async getUserByRole(role: UserRole): Promise<UserPersona | null> {
    if (!this.state) await this.init();
    return this.state!.users.find(u => u.role === role) || null;
  }

  public async getServiceRequests(): Promise<ServiceRequest[]> {
    if (!this.state) await this.init();
    return [...this.state!.requests];
  }

  public async getServiceRequestById(id: string): Promise<ServiceRequest | null> {
    if (!this.state) await this.init();
    const found = this.state!.requests.find(r => r.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async saveServiceRequest(request: ServiceRequest): Promise<void> {
    if (!this.state) await this.init();
    const idx = this.state!.requests.findIndex(r => r.id === request.id);
    if (idx >= 0) {
      this.state!.requests[idx] = request;
    } else {
      this.state!.requests.unshift(request);
    }
    this.persist();
  }

  public async getLedgerBlocks(): Promise<AuditLedgerEntry[]> {
    if (!this.state) await this.init();
    return [...this.state!.ledger];
  }

  public async appendLedgerBlock(block: AuditLedgerEntry): Promise<void> {
    if (!this.state) await this.init();
    this.state!.ledger.push(block);
    this.persist();
  }

  public async saveDocument(doc: any): Promise<void> {
    if (!this.state) await this.init();
    if (!(this.state as any).documents) (this.state as any).documents = [];
    (this.state as any).documents.push(doc);
    this.persist();
  }

  public async getDocumentById(id: string): Promise<any | null> {
    if (!this.state) await this.init();
    const docs = (this.state as any).documents || [];
    return docs.find((d: any) => d.id === id) || null;
  }

  public async getDocumentsByParcel(ulpin: string): Promise<any[]> {
    if (!this.state) await this.init();
    const docs = (this.state as any).documents || [];
    return docs.filter((d: any) => d.parcelUlpin === ulpin);
  }

  public async resetToSeed(): Promise<void> {
    this.state = buildSeedDatabase();
    this.persist();
  }
}

export const repository = new JsonFileRepository();
