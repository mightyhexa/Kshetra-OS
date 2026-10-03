import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { IRepository, PaginatedResult, ParcelFilter } from './types';
import { initializeSqliteSchema } from './sqliteSchema';
import { buildSeedDatabase } from './seed';
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

export class SqliteRepository implements IRepository {
  private db: Database.Database | null = null;

  private getDb(): Database.Database {
    if (!this.db) {
      const dbPath = config.sqlitePath || path.resolve(process.cwd(), 'data', 'kshetra.db');
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      initializeSqliteSchema(this.db);
    }
    return this.db;
  }

  public async init(): Promise<void> {
    const db = this.getDb();
    const countRow = db.prepare('SELECT COUNT(*) as cnt FROM parcels').get() as { cnt: number };
    if (!countRow || countRow.cnt !== 26) {
      console.log('[SQLite DB] Seeding 26 parcels into SQLite database...');
      await this.resetToSeed();
    }
  }

  public async getParcels(filter?: ParcelFilter): Promise<PaginatedResult<Parcel>> {
    const db = this.getDb();
    const rows = db.prepare('SELECT ulpin FROM parcels ORDER BY state_code, district, survey_number').all() as { ulpin: string }[];
    let allParcels: Parcel[] = [];
    for (const r of rows) {
      const p = await this.getParcelByUlpin(r.ulpin);
      if (p) allParcels.push(p);
    }

    const waterbodies = await this.getWaterbodies();

    if (filter) {
      if (filter.city && filter.city !== 'All India') {
        const c = filter.city.toLowerCase();
        allParcels = allParcels.filter(p => p.district.toLowerCase().includes(c) || p.state.toLowerCase().includes(c));
      }
      if (filter.disputed !== undefined) {
        allParcels = allParcels.filter(p => p.encumbrance.disputeFlag === filter.disputed);
      }
      if (filter.flagged) {
        allParcels = allParcels.filter(p => evaluateParcelRisks(p, allParcels, waterbodies).length > 0);
      }
      if (filter.q) {
        const q = filter.q.toLowerCase().trim();
        const cleanQ = cleanUlpin(q);
        allParcels = allParcels.filter(p => 
          p.ulpin.toLowerCase().includes(q) ||
          cleanUlpin(p.ulpin).includes(cleanQ) ||
          p.surveyNumber.toLowerCase().includes(q) ||
          p.ownership.ownerName.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.villageWard.toLowerCase().includes(q)
        );
      }
    }

    const total = allParcels.length;
    const page = filter?.page || 1;
    const limit = filter?.limit || 50;
    const startIndex = (page - 1) * limit;
    const items = allParcels.slice(startIndex, startIndex + limit);

    return { items, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  public async getParcelByUlpin(ulpin: string): Promise<Parcel | null> {
    const db = this.getDb();
    const clean = cleanUlpin(ulpin);
    const pRow = db.prepare("SELECT * FROM parcels WHERE ulpin = ? OR REPLACE(ulpin, '-', '') = ?").get(clean, clean) as any;
    if (!pRow) return null;

    const oRow = db.prepare('SELECT * FROM ownership WHERE parcel_ulpin = ?').get(pRow.ulpin) as any;
    const zRow = db.prepare('SELECT * FROM zoning WHERE parcel_ulpin = ?').get(pRow.ulpin) as any;
    const eRow = db.prepare('SELECT * FROM encumbrances WHERE parcel_ulpin = ?').get(pRow.ulpin) as any;
    const tRow = db.prepare('SELECT * FROM tax_records WHERE parcel_ulpin = ?').get(pRow.ulpin) as any;
    const sroRows = db.prepare('SELECT * FROM sro_deeds WHERE parcel_ulpin = ?').all(pRow.ulpin) as any[];
    const cersaiRows = db.prepare('SELECT * FROM cersai_charges WHERE parcel_ulpin = ?').all(pRow.ulpin) as any[];

    return {
      ulpin: pRow.ulpin,
      displayUlpin: pRow.display_ulpin,
      surveyNumber: pRow.survey_number,
      centroidLat: pRow.centroid_lat,
      centroidLon: pRow.centroid_lon,
      areaSqm: pRow.area_sqm,
      areaAcres: pRow.area_acres,
      state: pRow.state,
      stateCode: pRow.state_code,
      district: pRow.district,
      subDistrict: pRow.sub_district,
      villageWard: pRow.village_ward,
      pinCode: pRow.pin_code,
      boundaryGeojson: JSON.parse(pRow.boundary_geojson),
      ownership: oRow ? {
        parcelUlpin: oRow.parcel_ulpin,
        ownerName: oRow.owner_name,
        ownerGender: oRow.owner_gender,
        ownershipType: oRow.ownership_type,
        registrationDate: oRow.registration_date,
        registrationNumber: oRow.registration_number,
        subRegistrarOffice: oRow.sub_registrar_office,
        stampDutyPaidInr: oRow.stamp_duty_paid_inr,
        marketValuationInr: oRow.market_valuation_inr,
        coOwners: oRow.co_owners_json ? JSON.parse(oRow.co_owners_json) : undefined
      } : ({} as any),
      zoning: zRow ? {
        parcelUlpin: zRow.parcel_ulpin,
        masterPlanClassification: zRow.master_plan_classification,
        registeredLandUse: zRow.registered_land_use,
        floorAreaRatioAllowed: zRow.floor_area_ratio_allowed,
        floorAreaRatioUtilized: zRow.floor_area_ratio_utilized,
        buildingPermissionStatus: zRow.building_permission_status
      } : ({} as any),
      encumbrance: eRow ? {
        parcelUlpin: eRow.parcel_ulpin,
        hasMortgage: Boolean(eRow.has_mortgage),
        disputeFlag: Boolean(eRow.dispute_flag),
        stayOrderActive: Boolean(eRow.stay_order_active),
        stayOrderDetails: eRow.stay_order_details || undefined,
        courtCaseNumber: eRow.court_case_number || undefined,
        disputeReason: eRow.dispute_reason || undefined,
        mortgageDetails: eRow.mortgage_details_json ? JSON.parse(eRow.mortgage_details_json) : undefined
      } : ({} as any),
      tax: tRow ? {
        parcelUlpin: tRow.parcel_ulpin,
        propertyTaxAssessmentNo: tRow.property_tax_assessment_no,
        annualTaxDemandInr: tRow.annual_tax_demand_inr,
        taxStatus: tRow.tax_status,
        lastPaymentDate: tRow.last_payment_date || undefined,
        assessmentYear: tRow.assessment_year,
        lastAssessedValueInr: tRow.last_assessed_value_inr || undefined,
        waterConnectionId: tRow.water_connection_id || undefined,
        electricityConsumerNo: tRow.electricity_consumer_no || undefined
      } : ({} as any),
      sroDeeds: sroRows.map(s => ({
        deedId: s.deed_id,
        parcelUlpin: s.parcel_ulpin,
        deedType: s.deed_type,
        buyerName: s.buyer_name,
        sellerName: s.seller_name,
        registrationDate: s.registration_date,
        considerationAmountInr: s.consideration_amount_inr,
        sroCode: s.sro_code
      })),
      cersaiCharges: cersaiRows.map(c => ({
        chargeId: c.charge_id,
        parcelUlpin: c.parcel_ulpin,
        financialInstitution: c.financial_institution,
        assetType: c.asset_type,
        sanctionAmountInr: c.sanction_amount_inr,
        chargeCreationDate: c.charge_creation_date,
        status: c.status
      }))
    };
  }

  public async saveParcel(parcel: Parcel): Promise<void> {
    const db = this.getDb();
    const insertParcel = db.prepare(`
      INSERT OR REPLACE INTO parcels (
        ulpin, display_ulpin, survey_number, centroid_lat, centroid_lon, area_sqm,
        area_acres, state, state_code, district, sub_district, village_ward, pin_code, boundary_geojson
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertParcel.run(
      parcel.ulpin, parcel.displayUlpin, parcel.surveyNumber, parcel.centroidLat, parcel.centroidLon,
      parcel.areaSqm, parcel.areaAcres, parcel.state, parcel.stateCode, parcel.district,
      parcel.subDistrict, parcel.villageWard, parcel.pinCode, JSON.stringify(parcel.boundaryGeojson)
    );
  }

  public async getWaterbodies(): Promise<WaterbodyRecord[]> {
    const db = this.getDb();
    const rows = db.prepare('SELECT * FROM waterbodies').all() as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      district: r.district,
      state: r.state,
      bufferDistanceMeters: r.buffer_distance_meters,
      boundaryGeojson: JSON.parse(r.boundary_geojson)
    }));
  }

  public async getUsers(): Promise<UserPersona[]> {
    const db = this.getDb();
    const rows = db.prepare('SELECT * FROM users').all() as any[];
    return rows.map(r => ({
      id: r.id,
      fullName: r.full_name,
      role: r.role as UserRole,
      designation: r.designation || undefined,
      jurisdictionDistrict: r.jurisdiction_district || undefined,
      jurisdictionState: r.jurisdiction_state || undefined,
      aadhaarMasked: r.aadhaar_masked || undefined,
      officerBadgeId: r.officer_badge_id || undefined
    }));
  }

  public async getUserById(id: string): Promise<UserPersona | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  public async getUserByRole(role: UserRole): Promise<UserPersona | null> {
    const users = await this.getUsers();
    return users.find(u => u.role === role) || null;
  }

  public async getServiceRequests(): Promise<ServiceRequest[]> {
    const db = this.getDb();
    const reqs = db.prepare('SELECT * FROM requests ORDER BY submitted_at DESC').all() as any[];
    const result: ServiceRequest[] = [];
    for (const r of reqs) {
      const transitions = db.prepare('SELECT * FROM workflow_transitions WHERE request_id = ? ORDER BY timestamp ASC').all(r.id) as any[];
      result.push({
        id: r.id,
        parcelUlpin: r.parcel_ulpin,
        applicantName: r.applicant_name,
        applicantAadhaarMasked: r.applicant_aadhaar_masked,
        requestType: r.request_type,
        status: r.status,
        submittedAt: r.submitted_at,
        lastUpdatedAt: r.last_updated_at,
        urgency: r.urgency,
        supportingDocName: r.supporting_doc_name || undefined,
        history: transitions.map(t => ({
          id: t.id,
          fromStatus: t.from_status,
          toStatus: t.to_status,
          department: t.department,
          actionedByRole: t.actioned_by_role,
          actionedByName: t.actioned_by_name,
          timestamp: t.timestamp,
          remarks: t.remarks
        }))
      });
    }
    return result;
  }

  public async getServiceRequestById(id: string): Promise<ServiceRequest | null> {
    const all = await this.getServiceRequests();
    return all.find(r => r.id === id) || null;
  }

  public async saveServiceRequest(request: ServiceRequest): Promise<void> {
    const db = this.getDb();
    const upsertReq = db.prepare(`
      INSERT OR REPLACE INTO requests (
        id, parcel_ulpin, applicant_name, applicant_aadhaar_masked, request_type,
        status, submitted_at, last_updated_at, urgency, supporting_doc_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    upsertReq.run(
      request.id, request.parcelUlpin, request.applicantName, request.applicantAadhaarMasked,
      request.requestType, request.status, request.submittedAt, request.lastUpdatedAt,
      request.urgency, request.supportingDocName || null
    );

    const insertTrans = db.prepare(`
      INSERT OR REPLACE INTO workflow_transitions (
        id, request_id, from_status, to_status, department, actioned_by_role, actioned_by_name, timestamp, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of request.history) {
      insertTrans.run(t.id, request.id, t.fromStatus, t.toStatus, t.department, t.actionedByRole, t.actionedByName, t.timestamp, t.remarks);
    }
  }

  public async getLedgerBlocks(): Promise<AuditLedgerEntry[]> {
    const db = this.getDb();
    const rows = db.prepare('SELECT * FROM ledger_blocks ORDER BY block_index ASC').all() as any[];
    return rows.map(r => ({
      blockIndex: r.block_index,
      timestamp: r.timestamp,
      action: r.action,
      actorRole: r.actor_role,
      actorName: r.actor_name,
      actorId: r.actor_id,
      parcelUlpin: r.parcel_ulpin || undefined,
      details: r.details,
      metadataPayload: JSON.parse(r.metadata_json),
      previousHash: r.previous_hash,
      currentHash: r.current_hash
    }));
  }

  public async appendLedgerBlock(block: AuditLedgerEntry): Promise<void> {
    const db = this.getDb();
    const ins = db.prepare(`
      INSERT INTO ledger_blocks (
        block_index, timestamp, action, actor_role, actor_name, actor_id, parcel_ulpin,
        details, metadata_json, previous_hash, current_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    ins.run(
      block.blockIndex, block.timestamp, block.action, block.actorRole, block.actorName,
      block.actorId, block.parcelUlpin || null, block.details, JSON.stringify(block.metadataPayload),
      block.previousHash, block.currentHash
    );
  }

  public async saveDocument(doc: any): Promise<void> {
    const db = this.getDb();
    const ins = db.prepare(`
      INSERT INTO documents (
        id, parcel_ulpin, filename, original_name, mime_type, size_bytes,
        sha256_hash, uploaded_by, uploaded_role, uploaded_at, filepath
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    ins.run(
      doc.id, doc.parcelUlpin || null, doc.filename, doc.originalName, doc.mimeType,
      doc.sizeBytes, doc.sha256Hash, doc.uploadedBy, doc.uploadedRole, doc.uploadedAt, doc.filepath
    );
  }

  public async getDocumentById(id: string): Promise<any | null> {
    const db = this.getDb();
    const r = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any;
    if (!r) return null;
    return {
      id: r.id,
      parcelUlpin: r.parcel_ulpin || undefined,
      filename: r.filename,
      originalName: r.original_name,
      mimeType: r.mime_type,
      sizeBytes: r.size_bytes,
      sha256Hash: r.sha256_hash,
      uploadedBy: r.uploaded_by,
      uploadedRole: r.uploaded_role,
      uploadedAt: r.uploaded_at,
      filepath: r.filepath
    };
  }

  public async getDocumentsByParcel(ulpin: string): Promise<any[]> {
    const db = this.getDb();
    const rows = db.prepare('SELECT * FROM documents WHERE parcel_ulpin = ?').all(ulpin) as any[];
    return rows.map(r => ({
      id: r.id,
      parcelUlpin: r.parcel_ulpin || undefined,
      filename: r.filename,
      originalName: r.original_name,
      mimeType: r.mime_type,
      sizeBytes: r.size_bytes,
      sha256Hash: r.sha256_hash,
      uploadedBy: r.uploaded_by,
      uploadedRole: r.uploaded_role,
      uploadedAt: r.uploaded_at,
      filepath: r.filepath
    }));
  }

  public async resetToSeed(): Promise<void> {
    const db = this.getDb();
    const seed = buildSeedDatabase();

    db.transaction(() => {
      db.exec(`
        DELETE FROM workflow_transitions;
        DELETE FROM requests;
        DELETE FROM sro_deeds;
        DELETE FROM cersai_charges;
        DELETE FROM tax_records;
        DELETE FROM encumbrances;
        DELETE FROM zoning;
        DELETE FROM ownership;
        DELETE FROM parcels;
        DELETE FROM waterbodies;
        DELETE FROM users;
        DELETE FROM ledger_blocks;
        DELETE FROM documents;
      `);

      const insUser = db.prepare(`
        INSERT INTO users (id, full_name, role, designation, jurisdiction_district, jurisdiction_state, aadhaar_masked, officer_badge_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of seed.users) {
        insUser.run(u.id, u.fullName, u.role, u.designation || null, u.jurisdictionDistrict || null, u.jurisdictionState || null, u.aadhaarMasked || null, u.officerBadgeId || null);
      }

      const insWater = db.prepare(`
        INSERT INTO waterbodies (id, name, type, district, state, buffer_distance_meters, boundary_geojson)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const w of seed.waterbodies) {
        insWater.run(w.id, w.name, w.type, w.district, w.state, w.bufferDistanceMeters, JSON.stringify(w.boundaryGeojson));
      }

      const insParcel = db.prepare(`
        INSERT INTO parcels (ulpin, display_ulpin, survey_number, centroid_lat, centroid_lon, area_sqm, area_acres, state, state_code, district, sub_district, village_ward, pin_code, boundary_geojson)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insOwner = db.prepare(`
        INSERT INTO ownership (parcel_ulpin, owner_name, owner_gender, ownership_type, registration_date, registration_number, sub_registrar_office, stamp_duty_paid_inr, market_valuation_inr, co_owners_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insZoning = db.prepare(`
        INSERT INTO zoning (parcel_ulpin, master_plan_classification, registered_land_use, floor_area_ratio_allowed, floor_area_ratio_utilized, building_permission_status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const insEnc = db.prepare(`
        INSERT INTO encumbrances (parcel_ulpin, has_mortgage, dispute_flag, stay_order_active, stay_order_details, court_case_number, dispute_reason, mortgage_details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insTax = db.prepare(`
        INSERT INTO tax_records (parcel_ulpin, property_tax_assessment_no, annual_tax_demand_inr, tax_status, last_payment_date, assessment_year, last_assessed_value_inr, water_connection_id, electricity_consumer_no)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insSro = db.prepare(`
        INSERT INTO sro_deeds (deed_id, parcel_ulpin, deed_type, buyer_name, seller_name, registration_date, consideration_amount_inr, sro_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insCersai = db.prepare(`
        INSERT INTO cersai_charges (charge_id, parcel_ulpin, financial_institution, asset_type, sanction_amount_inr, charge_creation_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const p of seed.parcels) {
        insParcel.run(p.ulpin, p.displayUlpin, p.surveyNumber, p.centroidLat, p.centroidLon, p.areaSqm, p.areaAcres, p.state, p.stateCode, p.district, p.subDistrict, p.villageWard, p.pinCode, JSON.stringify(p.boundaryGeojson));
        insOwner.run(p.ulpin, p.ownership.ownerName, p.ownership.ownerGender || null, p.ownership.ownershipType, p.ownership.registrationDate, p.ownership.registrationNumber, p.ownership.subRegistrarOffice, p.ownership.stampDutyPaidInr, p.ownership.marketValuationInr, p.ownership.coOwners ? JSON.stringify(p.ownership.coOwners) : null);
        insZoning.run(p.ulpin, p.zoning.masterPlanClassification, p.zoning.registeredLandUse, p.zoning.floorAreaRatioAllowed, p.zoning.floorAreaRatioUtilized, p.zoning.buildingPermissionStatus);
        insEnc.run(p.ulpin, p.encumbrance.hasMortgage ? 1 : 0, p.encumbrance.disputeFlag ? 1 : 0, p.encumbrance.stayOrderActive ? 1 : 0, p.encumbrance.stayOrderDetails || null, p.encumbrance.courtCaseNumber || null, p.encumbrance.disputeReason || null, p.encumbrance.mortgageDetails ? JSON.stringify(p.encumbrance.mortgageDetails) : null);
        insTax.run(p.ulpin, p.tax.propertyTaxAssessmentNo, p.tax.annualTaxDemandInr, p.tax.taxStatus, p.tax.lastPaymentDate || null, p.tax.assessmentYear, p.tax.lastAssessedValueInr || null, p.tax.waterConnectionId || null, p.tax.electricityConsumerNo || null);

        if (p.sroDeeds) {
          for (const s of p.sroDeeds) {
            insSro.run(s.deedId, p.ulpin, s.deedType, s.buyerName, s.sellerName, s.registrationDate, s.considerationAmountInr, s.sroCode);
          }
        }
        if (p.cersaiCharges) {
          for (const c of p.cersaiCharges) {
            insCersai.run(c.chargeId, p.ulpin, c.financialInstitution, c.assetType, c.sanctionAmountInr, c.chargeCreationDate, c.status);
          }
        }
      }

      const insReq = db.prepare(`
        INSERT INTO requests (id, parcel_ulpin, applicant_name, applicant_aadhaar_masked, request_type, status, submitted_at, last_updated_at, urgency, supporting_doc_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insTrans = db.prepare(`
        INSERT INTO workflow_transitions (id, request_id, from_status, to_status, department, actioned_by_role, actioned_by_name, timestamp, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of seed.requests) {
        insReq.run(r.id, r.parcelUlpin, r.applicantName, r.applicantAadhaarMasked, r.requestType, r.status, r.submittedAt, r.lastUpdatedAt, r.urgency, r.supportingDocName || null);
        for (const t of r.history) {
          insTrans.run(t.id, r.id, t.fromStatus, t.toStatus, t.department, t.actionedByRole, t.actionedByName, t.timestamp, t.remarks);
        }
      }

      const insLedger = db.prepare(`
        INSERT INTO ledger_blocks (block_index, timestamp, action, actor_role, actor_name, actor_id, parcel_ulpin, details, metadata_json, previous_hash, current_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const b of seed.ledger) {
        insLedger.run(b.blockIndex, b.timestamp, b.action, b.actorRole, b.actorName, b.actorId, b.parcelUlpin || null, b.details, JSON.stringify(b.metadataPayload), b.previousHash, b.currentHash);
      }
    })();
  }
}
