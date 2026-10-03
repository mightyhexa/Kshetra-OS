import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../server/index';
import { repository } from '../server/repo';
import { generateDossierPdf, verifyDossierPdf } from '../server/services/dossierService';
import { validateMagicBytes } from '../server/services/documentService';
import { 
  checkR1Litigation, 
  checkR2BoundaryOverlap, 
  checkR3EcoBuffer, 
  checkR4ZoningMismatch 
} from '../server/services/riskRules';
import { 
  checkR5FarHeightViolation, 
  checkR6DuplicateSale, 
  checkR7LienDiscrepancy, 
  checkR8TaxArrears, 
  checkR9OwnershipAge 
} from '../server/services/riskRulesMore';
import { evaluateParcelRisks } from '../server/services/riskEngine';
import { verifyChain, setTamperOverlay, clearTamperOverlay, getEffectiveLedgerBlocks } from '../server/services/ledgerService';
import { Parcel, WaterbodyRecord } from '../shared/types';

describe('STAGE 2: Full-Stack Verification Suite', () => {
  let app: any;
  let citizenToken: string;
  let officerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await createExpressApp();
    await repository.resetToSeed();
    clearTamperOverlay();

    // Authenticate all 3 personas
    const citizenRes = await request(app).post('/api/auth/login').send({ role: 'citizen' });
    citizenToken = citizenRes.body.token;

    const officerRes = await request(app).post('/api/auth/login').send({ role: 'officer' });
    officerToken = officerRes.body.token;

    const adminRes = await request(app).post('/api/auth/login').send({ role: 'policy_admin' });
    adminToken = adminRes.body.token;
  });

  // 1. Auth Required
  describe('1. Authentication Gatekeeper', () => {
    it('rejects unauthenticated requests to protected endpoints with 401', async () => {
      const res1 = await request(app).get('/api/parcels');
      expect(res1.status).toBe(401);

      const res2 = await request(app).get('/api/requests');
      expect(res2.status).toBe(401);

      const res3 = await request(app).get('/api/ledger');
      expect(res3.status).toBe(401);
    });

    it('permits authenticated requests with valid JWT', async () => {
      const res = await request(app)
        .get('/api/parcels')
        .set('Authorization', `Bearer ${citizenToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // 2. Citizen Role Masking
  describe('2. Citizen Data Privacy & Server-Side Field Stripping', () => {
    it('physically strips mortgage details, court case numbers, stay orders, and co-owners for citizens', async () => {
      const res = await request(app)
        .get('/api/parcels')
        .set('Authorization', `Bearer ${citizenToken}`);

      const parcels = res.body.data;
      for (const p of parcels) {
        expect(p.encumbrance.mortgageDetails).toBeUndefined();
        expect(p.encumbrance.courtCaseNumber).toBeUndefined();
        expect(p.encumbrance.stayOrderDetails).toBeUndefined();
        expect(p.ownership.coOwners).toBeUndefined();
      }
    });

    it('retains complete details for land officers and policy administrators', async () => {
      const res = await request(app)
        .get('/api/parcels')
        .set('Authorization', `Bearer ${officerToken}`);

      const parcels = res.body.data;
      const mortgaged = parcels.find((p: any) => p.encumbrance.hasMortgage);
      expect(mortgaged).toBeDefined();
      expect(mortgaged.encumbrance.mortgageDetails).toBeDefined();
    });

    it('strips R1 court case and R7 bank details from risk findings for citizens', async () => {
      const allParcels = (await repository.getParcels({ limit: 100 })).items;
      const disputed = allParcels.find(p => p.encumbrance.disputeFlag)!;

      const res = await request(app)
        .get(`/api/parcels/${disputed.ulpin}/risks`)
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.status).toBe(200);
      const r1 = res.body.findings.find((f: any) => f.ruleId === 'R1');
      if (r1) {
        expect(r1.evidence.courtCaseNumber).toBeUndefined();
        expect(r1.evidence.stayOrderDetails).toBeUndefined();
        expect(r1.evidence.notice).toContain('restricted');
      }
    });
  });

  // 3. Risk Rules R1 to R9 Pure Functions
  describe('3. Risk Rules Pure Functions (R1 - R9)', () => {
    let sampleParcels: Parcel[];
    let waterbodies: WaterbodyRecord[];

    beforeAll(async () => {
      sampleParcels = (await repository.getParcels({ limit: 100 })).items;
      waterbodies = await repository.getWaterbodies();
    });

    it('R1: Flags active litigation and stay orders as rose', () => {
      const disputed = sampleParcels.find(p => p.encumbrance.disputeFlag && p.encumbrance.stayOrderActive)!;
      const r1 = checkR1Litigation(disputed);
      expect(r1).not.toBeNull();
      expect(r1?.severity).toBe('rose');
      expect(r1?.responsibleOffice).toContain('Revenue Court');
    });

    it('R2: Flags >5% overlap as rose with partner ULPIN and intersection evidence; tolerance as info', () => {
      let foundRose = false;
      let foundInfo = false;

      for (const p of sampleParcels) {
        const overlaps = checkR2BoundaryOverlap(p, sampleParcels);
        for (const o of overlaps) {
          if (o.severity === 'rose') {
            foundRose = true;
            expect(o.evidence.partnerUlpin).toBeDefined();
            expect(o.evidence.intersectionGeometry).toBeDefined();
            expect(o.evidence.overlapPercentage).toBeGreaterThan(5);
          }
          if (o.severity === 'info') {
            foundInfo = true;
            expect(o.plainReason).toContain('legacy');
          }
        }
      }

      expect(foundRose).toBe(true);
      expect(foundInfo).toBe(true);
    });

    it('R3: Flags parcels within 65m of waterbody', () => {
      let foundR3 = false;
      for (const p of sampleParcels) {
        const findings = checkR3EcoBuffer(p, waterbodies);
        if (findings.length > 0) {
          foundR3 = true;
          expect(findings[0].ruleId).toBe('R3');
          expect(['rose', 'amber']).toContain(findings[0].severity);
          expect(findings[0].evidence.bufferStatutoryMeters).toBe(65);
        }
      }
      expect(foundR3).toBe(true);
    });

    it('R4: Flags master plan zoning mismatch as amber', () => {
      const mismatch = sampleParcels.find(p => p.zoning.masterPlanClassification !== p.zoning.registeredLandUse)!;
      const r4 = checkR4ZoningMismatch(mismatch);
      expect(r4).not.toBeNull();
      expect(r4?.severity).toBe('amber');
      expect(r4?.responsibleOffice).toContain('Town Planning');
    });

    it('R5: Evaluates FAR and height violations', () => {
      const fakeParcel = JSON.parse(JSON.stringify(sampleParcels[0])) as Parcel;
      fakeParcel.zoning.floorAreaRatioAllowed = 1.5;
      fakeParcel.zoning.floorAreaRatioUtilized = 2.4;
      const r5 = checkR5FarHeightViolation(fakeParcel);
      expect(r5).not.toBeNull();
      expect(['rose', 'amber']).toContain(r5?.severity);
      expect(r5?.plainReason).toContain('Floor Area Ratio');
    });

    it('R6: Flags duplicate sale deeds registered within 90 days as rose', () => {
      const dupParcel = sampleParcels.find(p => {
        if (!p.sroDeeds || p.sroDeeds.length < 2) return false;
        const sales = p.sroDeeds.filter(d => d.deedType === 'SALE_DEED');
        return sales.length >= 2;
      })!;

      const r6 = checkR6DuplicateSale(dupParcel);
      expect(r6).not.toBeNull();
      expect(r6?.severity).toBe('rose');
      expect(r6?.responsibleOffice).toContain('Sub-Registrar');
    });

    it('R7: Flags cross-registry lien discrepancy honestly between CERSAI and SRO', () => {
      const lienParcel = sampleParcels.find(p => {
        const hasCersai = p.cersaiCharges?.some(c => c.status === 'ACTIVE');
        return hasCersai && !p.encumbrance.hasMortgage;
      })!;

      const r7 = checkR7LienDiscrepancy(lienParcel);
      expect(r7).not.toBeNull();
      expect(r7?.severity).toBe('amber');
      expect(r7?.plainReason).toContain('cross-registry lien discrepancy');
    });

    it('R8: Flags municipal property tax arrears or stale assessment', () => {
      const taxParcel = sampleParcels.find(p => p.tax.taxStatus === 'Outstanding')!;
      const r8 = checkR8TaxArrears(taxParcel);
      expect(r8).not.toBeNull();
      expect(['amber', 'info']).toContain(r8?.severity);
    });

    it('R9: Acknowledges long-standing continuous ownership lineage', () => {
      const fake = JSON.parse(JSON.stringify(sampleParcels[0])) as Parcel;
      fake.ownership.registrationDate = '1985-04-12';
      const r9 = checkR9OwnershipAge(fake);
      expect(r9).not.toBeNull();
      expect(r9?.severity).toBe('info');
      expect(r9?.plainReason).toContain('continuously registered');
    });
  });

  // 4. Ledger Verify, Tamper Simulation, and Reset
  describe('4. Ledger Verification, In-Memory Tamper Overlay & Reset', () => {
    it('verifies pristine ledger chain with zero broken pointers', async () => {
      const res = await request(app)
        .get('/api/ledger/verify')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.checked).toBeGreaterThan(0);
      expect(res.body.firstBrokenIndex).toBeUndefined();
    });

    it('detects tampering immediately and names exact broken block when tamper-demo is invoked', async () => {
      // Invoke tamper-demo as policy admin
      const tamperRes = await request(app)
        .post('/api/ledger/tamper-demo')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(tamperRes.status).toBe(200);
      expect(tamperRes.body.tampered).toBe(true);
      expect(tamperRes.body.tamperedBlockIndex).toBe(1);

      // Verify should now fail and identify block #1
      const verifyRes = await request(app)
        .get('/api/ledger/verify')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(verifyRes.body.valid).toBe(false);
      expect(verifyRes.body.firstBrokenIndex).toBe(1);
      expect(verifyRes.body.reason).toContain('Cryptographic tamper detected at Block #1');
    });

    it('clears tamper overlay on tamper-reset and restores pristine state', async () => {
      const resetRes = await request(app)
        .post('/api/ledger/tamper-reset')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.tampered).toBe(false);

      // Verify is pristine again
      const verifyRes = await request(app)
        .get('/api/ledger/verify')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(verifyRes.body.valid).toBe(true);
    });

    it('exports complete ledger with cryptographic metadata', async () => {
      const res = await request(app)
        .get('/api/ledger/export')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.metadata).toBeDefined();
      expect(res.body.verification).toBeDefined();
      expect(res.body.chain.length).toBeGreaterThan(0);
    });
  });

  // 5. Workflow State Machine Transitions
  describe('5. Workflow Engine & State Machine Validation', () => {
    let testRequestId: string;

    it('creates a service request in Applied state', async () => {
      const parcels = (await repository.getParcels({ limit: 1 })).items;
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          parcelUlpin: parcels[0].ulpin,
          applicantName: 'Rajesh K. Verma',
          requestType: 'Mutation of Title',
          urgency: 'Normal'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toMatch(/^REQ-2026-/);
      expect(res.body.data.status).toBe('Applied');
      testRequestId = res.body.data.id;
    });

    it('rejects illegal transition attempted by citizen with 403', async () => {
      const res = await request(app)
        .post(`/api/requests/${testRequestId}/transition`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          nextStatus: 'Approved',
          department: 'Land Records & Survey',
          remarks: 'Citizen self-approval attempt'
        });

      expect([403, 409]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('rejects illegal state skip from Applied directly to Approved with 409', async () => {
      const res = await request(app)
        .post(`/api/requests/${testRequestId}/transition`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          nextStatus: 'Approved',
          department: 'Land Records & Survey',
          remarks: 'Attempting to skip Under Review and Cross Verified'
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('WORKFLOW_TRANSITION_FAILED');
      expect(res.body.error.message).toContain('Illegal state transition');
    });

    it('allows valid sequential transition: Applied -> Under Review', async () => {
      const res = await request(app)
        .post(`/api/requests/${testRequestId}/transition`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({
          nextStatus: 'Under Review',
          department: 'Land Records & Survey',
          remarks: 'Official verification initiated under survey protocol.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Under Review');
      expect(res.body.data.history.length).toBe(2);
    });
  });

  // 6. Document Upload Magic Bytes & Integrity
  describe('6. Document Upload, Magic-Byte Inspection & Disk Storage', () => {
    it('validates magic bytes for genuine PDF, PNG, and JPEG', () => {
      const validPdf = Buffer.from('%PDF-1.4 sample content');
      expect(validateMagicBytes(validPdf).valid).toBe(true);
      expect(validateMagicBytes(validPdf).detectedMime).toBe('application/pdf');

      const validPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]);
      expect(validateMagicBytes(validPng).valid).toBe(true);

      const fakeFile = Buffer.from('FAKE TEXT pretending to be pdf');
      expect(validateMagicBytes(fakeFile).valid).toBe(false);
    });

    it('rejects uploaded file with spoofed extension and wrong magic bytes with 400', async () => {
      const fakeBuffer = Buffer.from('This is a plain text file, not a real PDF document.');
      const res = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${citizenToken}`)
        .attach('file', fakeBuffer, 'malicious_spoof.pdf');

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('magic bytes');
    });

    it('accepts genuine PDF buffer, anchors SHA-256 in ledger, and stores on disk', async () => {
      const genuinePdfBuffer = Buffer.from('%PDF-1.4\n%genuine cadastral deed document\n%%EOF');
      const res = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${citizenToken}`)
        .attach('file', genuinePdfBuffer, 'title_deed_1985.pdf')
        .field('parcelUlpin', 'KA-25AG-UFCU-4RZ9');

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('File integrity anchored; no OCR');
      expect(res.body.data.sha256Hash).toBeDefined();

      // Verify the download endpoint returns the file
      const docId = res.body.data.id;
      const downloadRes = await request(app)
        .get(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(downloadRes.status).toBe(200);
      expect(downloadRes.headers['x-document-sha256']).toBe(res.body.data.sha256Hash);
    });
  });

  // 7. Dossier Generation & Cryptographic Verification
  describe('7. Dossier PDF Generation & Cryptographic Hash Verification', () => {
    let generatedPdfBuffer: Buffer;
    let parcelUlpin: string;

    it('generates role-aware Cadastral Dossier PDF with PDFKit and anchors DOSSIER_ISSUED in ledger', async () => {
      const parcel = (await repository.getParcels({ limit: 1 })).items[0];
      parcelUlpin = parcel.ulpin;

      const res = await request(app)
        .post(`/api/dossier/${parcel.ulpin}`)
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['x-dossier-sha256']).toBeDefined();
      expect(res.body).toBeDefined();

      generatedPdfBuffer = res.body;
      expect(generatedPdfBuffer.slice(0, 4).toString()).toBe('%PDF');
    });

    it('verifies generated dossier PDF returns MATCH with exact ledger block', async () => {
      const res = await request(app)
        .post('/api/dossier/verify')
        .set('Authorization', `Bearer ${officerToken}`)
        .attach('file', generatedPdfBuffer, 'dossier_to_verify.pdf');

      expect(res.status).toBe(200);
      expect(res.body.matched).toBe(true);
      expect(res.body.status).toBe('MATCH');
      expect(res.body.block).toBeDefined();
      expect(res.body.block.action).toBe('DOSSIER_ISSUED');
    });

    it('verifies corrupted or altered PDF returns NO_MATCH', async () => {
      // Alter one byte in the PDF buffer
      const corruptedPdf = Buffer.from(generatedPdfBuffer);
      corruptedPdf[corruptedPdf.length - 20] = (corruptedPdf[corruptedPdf.length - 20] + 1) % 256;

      const res = await request(app)
        .post('/api/dossier/verify')
        .set('Authorization', `Bearer ${officerToken}`)
        .attach('file', corruptedPdf, 'corrupted_dossier.pdf');

      expect(res.status).toBe(200);
      expect(res.body.matched).toBe(false);
      expect(res.body.status).toBe('NO_MATCH');
    });
  });
});
