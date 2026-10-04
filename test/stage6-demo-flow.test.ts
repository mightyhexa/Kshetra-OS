import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../server/index';
import { repository } from '../server/repo';
import { clearTamperOverlay } from '../server/services/ledgerService';
import { scanForForbiddenCitizenKeys } from '../server/services/serializers';

describe('STAGE 6: Complete End-To-End Video Story Demo Flow API Test', () => {
  let app: any;
  let citizenToken: string;
  let officerToken: string;
  let adminToken: string;
  let targetUlpin: string;
  let createdRequestId: string;

  beforeAll(async () => {
    app = await createExpressApp();
    await repository.resetToSeed();
    clearTamperOverlay();
  });

  afterAll(async () => {
    await repository.resetToSeed();
    clearTamperOverlay();
  });

  it('Step 1: Citizen, Officer, and Admin Login over HTTP', async () => {
    const citRes = await request(app).post('/api/auth/login').send({ role: 'citizen' });
    expect(citRes.status).toBe(200);
    expect(citRes.body.token).toBeDefined();
    citizenToken = citRes.body.token;

    const offRes = await request(app).post('/api/auth/login').send({ role: 'officer' });
    expect(offRes.status).toBe(200);
    expect(offRes.body.token).toBeDefined();
    officerToken = offRes.body.token;

    const admRes = await request(app).post('/api/auth/login').send({ role: 'policy_admin' });
    expect(admRes.status).toBe(200);
    expect(admRes.body.token).toBeDefined();
    adminToken = admRes.body.token;
  });

  it('Step 2: Citizen parcel view physically strips forbidden fields (mortgageDetails, courtCaseNumber)', async () => {
    const res = await request(app)
      .get('/api/parcels')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    const parcels = Array.isArray(res.body.data) ? res.body.data : res.body.data?.items || [];
    expect(parcels.length).toBeGreaterThan(0);
    targetUlpin = parcels[0].ulpin;

    const citizenParcelRes = await request(app)
      .get(`/api/parcels/${targetUlpin}`)
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(citizenParcelRes.status).toBe(200);
    const parcelData = citizenParcelRes.body.data;

    // Assert sensitive fields are physically absent from JSON
    const violations = scanForForbiddenCitizenKeys(parcelData);
    expect(violations.length).toBe(0);
    expect(parcelData.encumbrance?.mortgageDetails).toBeUndefined();
    expect(parcelData.encumbrance?.courtCaseNumber).toBeUndefined();
  });

  it('Step 3: Officer parcel view includes complete unstripped sensitive fields', async () => {
    const officerParcelRes = await request(app)
      .get(`/api/parcels/${targetUlpin}`)
      .set('Authorization', `Bearer ${officerToken}`);

    expect(officerParcelRes.status).toBe(200);
    const parcelData = officerParcelRes.body.data;
    expect(parcelData.encumbrance).toBeDefined();
  });

  it('Step 4: Citizen submits service request with attached PDF evidence document', async () => {
    const fakePdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

    const uploadRes = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('parcelUlpin', targetUlpin)
      .attach('file', fakePdfBuffer, { filename: 'deed_evidence.pdf', contentType: 'application/pdf' });

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.success).toBe(true);

    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        parcelUlpin: targetUlpin,
        requestType: 'PARTITION_SURVEY',
        remarks: 'Submitting statutory partition deed for subdivision survey'
      });

    expect(reqRes.status).toBe(201);
    expect(reqRes.body.data.id).toBeDefined();
    createdRequestId = reqRes.body.data.id;
  });

  it('Step 5: Officer authorizes request transition with official remarks', async () => {
    const transRes = await request(app)
      .post(`/api/requests/${createdRequestId}/transition`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        nextStatus: 'Under Review',
        department: 'Tahsildar Revenue Cell',
        remarks: 'Verified deed uploaded evidence against SRO registry. Initiating field survey.'
      });

    expect(transRes.status).toBe(200);
    expect(transRes.body.data.status).toBe('Under Review');
  });

  it('Step 6: Ledger verify valid -> tamper -> verify invalid (naming broken block) -> reset -> valid', async () => {
    // Initial verification valid
    const verifyValidRes = await request(app)
      .post('/api/ledger/verify')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(verifyValidRes.status).toBe(200);
    expect(verifyValidRes.body.result.isValid).toBe(true);

    // Simulate Tamper
    const tamperRes = await request(app)
      .post('/api/ledger/tamper')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(tamperRes.status).toBe(200);
    const brokenIndex = tamperRes.body.tamperedBlockIndex;
    expect(brokenIndex).toBeDefined();

    // Verify after tamper names broken block
    const verifyTamperedRes = await request(app)
      .post('/api/ledger/verify')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(verifyTamperedRes.status).toBe(200);
    expect(verifyTamperedRes.body.result.isValid).toBe(false);
    expect(verifyTamperedRes.body.result.brokenBlockIndex).toBe(brokenIndex);

    // Reset ledger
    const resetRes = await request(app)
      .post('/api/ledger/reset')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resetRes.status).toBe(200);

    // Verify after reset is valid again
    const verifyRestoredRes = await request(app)
      .post('/api/ledger/verify')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(verifyRestoredRes.status).toBe(200);
    expect(verifyRestoredRes.body.result.isValid).toBe(true);
  });

  it('Step 7: Server-Side PDF Dossier Download -> Verify MATCH -> Byte Modified -> Verify NO_MATCH', async () => {
    const dossierRes = await request(app)
      .post(`/api/dossier/${targetUlpin}`)
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(dossierRes.status).toBe(200);
    expect(dossierRes.header['content-type']).toContain('application/pdf');
    const pdfBuffer: Buffer = dossierRes.body;

    // Verify unaltered PDF -> MATCH
    const matchVerifyRes = await request(app)
      .post('/api/dossier/verify')
      .set('Authorization', `Bearer ${citizenToken}`)
      .attach('file', pdfBuffer, 'authentic_dossier.pdf');

    expect(matchVerifyRes.status).toBe(200);
    expect(matchVerifyRes.body.status).toBe('MATCH');

    // Modify 1 byte in PDF -> NO_MATCH
    const tamperedPdfBuffer = Buffer.from(pdfBuffer);
    tamperedPdfBuffer[tamperedPdfBuffer.length - 10] ^= 0xFF;

    const noMatchVerifyRes = await request(app)
      .post('/api/dossier/verify')
      .set('Authorization', `Bearer ${citizenToken}`)
      .attach('file', tamperedPdfBuffer, 'tampered_dossier.pdf');

    expect(noMatchVerifyRes.status).toBe(200);
    expect(noMatchVerifyRes.body.status).toBe('NO_MATCH');
  });

  it('Step 8: Admin Reset Demo Endpoint (POST /api/admin/reset-demo) and 403 Role Enforcement', async () => {
    // Citizen gets 403
    const citResetRes = await request(app)
      .post('/api/admin/reset-demo')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(citResetRes.status).toBe(403);

    // Officer gets 403
    const offResetRes = await request(app)
      .post('/api/admin/reset-demo')
      .set('Authorization', `Bearer ${officerToken}`);
    expect(offResetRes.status).toBe(403);

    // Admin succeeds and logs event in ledger
    const adminResetRes = await request(app)
      .post('/api/admin/reset-demo')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminResetRes.status).toBe(200);
    expect(adminResetRes.body.success).toBe(true);
    expect(adminResetRes.body.resetBlockIndex).toBeDefined();

    // Verify ledger contains ADMIN_DEMO_RESET action
    const ledgerRes = await request(app)
      .get('/api/ledger')
      .set('Authorization', `Bearer ${adminToken}`);

    const resetBlock = ledgerRes.body.data.find((b: any) => b.action === 'ADMIN_DEMO_RESET');
    expect(resetBlock).toBeDefined();
    expect(resetBlock.actorRole).toBe('policy_admin');
  });
});
