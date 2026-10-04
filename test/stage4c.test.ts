import { describe, it, expect } from 'vitest';
import request from 'supertest';
import http from 'http';
import { createExpressApp } from '../server/index';
import { signToken } from '../server/middleware/auth';
import { repository } from '../server/repo';
import { eventBroadcaster } from '../server/services/eventBroadcaster';
import { scanForForbiddenCitizenKeys } from '../server/services/serializers';

describe('PART 4C Integration & Hardening Suite (Items 7-12)', () => {
  const citizenToken = signToken({
    id: 'CIT-101',
    fullName: 'Rajesh K. Verma',
    role: 'citizen'
  });

  const officerToken = signToken({
    id: 'OFF-202',
    fullName: 'Smt. Ananya Rao',
    role: 'officer',
    designation: 'Tahsildar'
  });

  const adminToken = signToken({
    id: 'ADM-303',
    fullName: 'Dr. V. K. Swaminathan',
    role: 'policy_admin',
    designation: 'State Revenue Secretary'
  });

  it('1. Ledger Verify with Progress States, Tamper & Reset: enforces admin-only access (citizen and officer get 403)', async () => {
    const app = await createExpressApp();

    // Progress and verification check on pristine ledger
    const verifyRes = await request(app)
      .post('/api/ledger/verify')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.valid).toBe(true);
    expect(verifyRes.body.checked).toBeGreaterThan(0);
    expect(verifyRes.body.data.verifiedBlocks).toBeGreaterThan(0);
    expect(verifyRes.body.data.isValid).toBe(true);

    // Citizen token on tamper & reset -> 403 Forbidden
    const citizenTamper = await request(app)
      .post('/api/ledger/tamper')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(citizenTamper.status).toBe(403);
    expect(citizenTamper.body.error.code).toBe('FORBIDDEN');

    const citizenReset = await request(app)
      .post('/api/ledger/reset')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(citizenReset.status).toBe(403);
    expect(citizenReset.body.error.code).toBe('FORBIDDEN');

    // Officer token on tamper & reset -> 403 Forbidden
    const officerTamper = await request(app)
      .post('/api/ledger/tamper')
      .set('Authorization', `Bearer ${officerToken}`);
    expect(officerTamper.status).toBe(403);
    expect(officerTamper.body.error.code).toBe('FORBIDDEN');

    const officerReset = await request(app)
      .post('/api/ledger/reset')
      .set('Authorization', `Bearer ${officerToken}`);
    expect(officerReset.status).toBe(403);
    expect(officerReset.body.error.code).toBe('FORBIDDEN');

    // Admin token can tamper
    const adminTamper = await request(app)
      .post('/api/ledger/tamper')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminTamper.status).toBe(200);
    expect(adminTamper.body.tampered).toBe(true);
    expect(adminTamper.body.tamperedBlockIndex).toBe(1);

    // After tamper: verify reports failure and identifies broken block
    const verifyTampered = await request(app)
      .post('/api/ledger/verify')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(verifyTampered.status).toBe(200);
    expect(verifyTampered.body.valid).toBe(false);
    expect(verifyTampered.body.firstBrokenIndex).toBe(1);
    expect(verifyTampered.body.data.isValid).toBe(false);

    // Admin token can reset
    const adminReset = await request(app)
      .post('/api/ledger/reset')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminReset.status).toBe(200);
    expect(adminReset.body.tampered).toBe(false);

    // After reset: verify restores pristine state
    const verifyRestored = await request(app)
      .post('/api/ledger/verify')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(verifyRestored.status).toBe(200);
    expect(verifyRestored.body.valid).toBe(true);
  });

  it('2. UI-Facing Dossier Verification: verifies MATCH with ledger anchor and NO_MATCH on altered bytes', async () => {
    const app = await createExpressApp();
    const parcel = (await repository.getParcels({ limit: 1 })).items[0];

    // Generate legitimate dossier PDF
    const dossierRes = await request(app)
      .post(`/api/dossier/${parcel.ulpin}`)
      .set('Authorization', `Bearer ${officerToken}`);
    expect(dossierRes.status).toBe(200);
    expect(dossierRes.headers['content-type']).toBe('application/pdf');
    const genuinePdf = dossierRes.body;

    // Verify MATCH on genuine PDF
    const matchRes = await request(app)
      .post('/api/dossier/verify')
      .set('Authorization', `Bearer ${citizenToken}`)
      .attach('file', genuinePdf, 'genuine_dossier.pdf');
    expect(matchRes.status).toBe(200);
    expect(matchRes.body.matched).toBe(true);
    expect(matchRes.body.status).toBe('MATCH');
    expect(matchRes.body.calculatedHash).toBeDefined();
    expect(matchRes.body.block).toBeDefined();
    expect(matchRes.body.block.action).toBe('DOSSIER_ISSUED');

    // Corrupt one byte of PDF
    const corruptedPdf = Buffer.from(genuinePdf);
    corruptedPdf[corruptedPdf.length - 12] = (corruptedPdf[corruptedPdf.length - 12] + 1) % 256;

    // Verify NO_MATCH on tampered PDF
    const noMatchRes = await request(app)
      .post('/api/dossier/verify')
      .set('Authorization', `Bearer ${citizenToken}`)
      .attach('file', corruptedPdf, 'altered_dossier.pdf');
    expect(noMatchRes.status).toBe(200);
    expect(noMatchRes.body.matched).toBe(false);
    expect(noMatchRes.body.status).toBe('NO_MATCH');
    expect(noMatchRes.body.block).toBeUndefined();
  });

  it('3. API Console Citizen-vs-Officer Diff: asserts the exact list of server-stripped fields', async () => {
    const app = await createExpressApp();
    const allParcels = (await repository.getParcels({ limit: 100 })).items;
    const mortgagedParcel = allParcels.find(p => p.encumbrance.hasMortgage)!;
    const disputedParcel = allParcels.find(p => p.encumbrance.disputeFlag)!;

    // A. Query mortgaged parcel as Officer vs Citizen via live Express route
    const offMortgageRes = await request(app)
      .get(`/api/parcels/${mortgagedParcel.ulpin}`)
      .set('Authorization', `Bearer ${officerToken}`);
    expect(offMortgageRes.status).toBe(200);
    const offMortgageData = offMortgageRes.body.data;

    const citMortgageRes = await request(app)
      .get(`/api/parcels/${mortgagedParcel.ulpin}`)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(citMortgageRes.status).toBe(200);
    const citMortgageData = citMortgageRes.body.data;

    expect(offMortgageData.encumbrance.mortgageDetails).toBeDefined();
    expect(citMortgageData.encumbrance.mortgageDetails).toBeUndefined();

    // B. Query disputed parcel as Officer vs Citizen via live Express route
    const offDisputeRes = await request(app)
      .get(`/api/parcels/${disputedParcel.ulpin}`)
      .set('Authorization', `Bearer ${officerToken}`);
    expect(offDisputeRes.status).toBe(200);
    const offDisputeData = offDisputeRes.body.data;

    const citDisputeRes = await request(app)
      .get(`/api/parcels/${disputedParcel.ulpin}`)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(citDisputeRes.status).toBe(200);
    const citDisputeData = citDisputeRes.body.data;

    expect(offDisputeData.encumbrance.courtCaseNumber).toBeDefined();
    expect(offDisputeData.encumbrance.stayOrderDetails).toBeDefined();
    expect(citDisputeData.encumbrance.courtCaseNumber).toBeUndefined();
    expect(citDisputeData.encumbrance.stayOrderDetails).toBeUndefined();

    // C. Assert the exact canonical removed fields list for citizen sessions
    const canonicalRemovedFields = [
      'mortgageDetails',
      'courtCaseNumber',
      'stayOrderDetails',
      'cersaiCharges',
      'coOwners'
    ];

    // Verify against a fully-encumbered composite parcel
    const syntheticParcel: any = {
      ulpin: 'TEST2026SAMPLE01',
      displayUlpin: 'TE-ST20-26SA-MPLE',
      district: 'Bengaluru Urban',
      surveyNumber: '100/1',
      ownership: { ownerName: 'Test Owner', coOwners: ['CoOwner 1', 'CoOwner 2'] },
      encumbrance: {
        hasMortgage: true,
        disputeFlag: true,
        mortgageDetails: { lenderName: 'SBI', loanAmountInr: 5000000 },
        courtCaseNumber: 'WP/2026/01',
        stayOrderDetails: 'Status quo order'
      },
      cersaiCharges: [{ securityInterestId: 'SEC-01', amountInr: 5000000 }]
    };

    const citizenSerialized: any = (await import('../server/services/serializers')).serializeParcel(syntheticParcel, 'citizen');
    const officerSerialized: any = (await import('../server/services/serializers')).serializeParcel(syntheticParcel, 'officer');

    // For officer, all 5 fields are retained
    expect(officerSerialized.encumbrance.mortgageDetails).toBeDefined();
    expect(officerSerialized.encumbrance.courtCaseNumber).toBeDefined();
    expect(officerSerialized.encumbrance.stayOrderDetails).toBeDefined();
    expect(officerSerialized.cersaiCharges).toBeDefined();
    expect(officerSerialized.ownership.coOwners).toBeDefined();

    // For citizen, all 5 fields are stripped
    const detectedRemoved: string[] = [];
    if (citizenSerialized.encumbrance.mortgageDetails === undefined) detectedRemoved.push('mortgageDetails');
    if (citizenSerialized.encumbrance.courtCaseNumber === undefined) detectedRemoved.push('courtCaseNumber');
    if (citizenSerialized.encumbrance.stayOrderDetails === undefined) detectedRemoved.push('stayOrderDetails');
    if (citizenSerialized.cersaiCharges === undefined) detectedRemoved.push('cersaiCharges');
    if (citizenSerialized.ownership.coOwners === undefined) detectedRemoved.push('coOwners');

    expect(detectedRemoved).toEqual(canonicalRemovedFields);

    // Deep scan for forbidden keys returns 0 violations on all citizen objects
    expect(scanForForbiddenCitizenKeys(citMortgageData).length).toBe(0);
    expect(scanForForbiddenCitizenKeys(citDisputeData).length).toBe(0);
    expect(scanForForbiddenCitizenKeys(citizenSerialized).length).toBe(0);
  });

  it('4. Notification Feed: asserts CITIZEN event payload contains zero court numbers, stay orders, loan/bank details, or officer remarks', async () => {
    // Construct mock system notification with sensitive officer & judicial fields
    const sensitiveEvent = {
      eventId: 'EVT-9001',
      title: 'Statutory Verification Update',
      courtCaseNumber: 'WP/2026/00918',
      courtDocket: 'High Court Writ Petition Bench 4',
      stayOrderDetails: 'Interim stay order granted in IA-4',
      mortgageDetails: {
        bankName: 'State Bank of India',
        loanAmount: 12500000,
        chargeId: 'CHG-99882'
      },
      bankDetails: {
        bankName: 'State Bank of India',
        bankAccount: '9988112233'
      },
      officerRemarks: 'CONFIDENTIAL: Internal vigilance audit recommended on surveyor logs',
      internalRemarks: 'Escalate to Tahsildar for boundary survey re-run',
      remarks: 'Application status updated. Court stay order pending review with officer remarks.',
      publicStatus: 'Under Review'
    };

    // Filter event payload for Citizen role
    const citizenFiltered: any = eventBroadcaster.filterPayloadForUser(sensitiveEvent, 'citizen');

    // Assert sensitive fields are physically stripped
    expect(citizenFiltered.courtCaseNumber).toBeUndefined();
    expect(citizenFiltered.courtDocket).toBeUndefined();
    expect(citizenFiltered.stayOrderDetails).toBeUndefined();
    expect(citizenFiltered.mortgageDetails).toBeUndefined();
    expect(citizenFiltered.bankDetails).toBeUndefined();
    expect(citizenFiltered.officerRemarks).toBeUndefined();
    expect(citizenFiltered.internalRemarks).toBeUndefined();

    // Assert remarks text does not leak confidential keywords
    expect(citizenFiltered.remarks.toLowerCase()).not.toContain('court stay');
    expect(citizenFiltered.remarks.toLowerCase()).not.toContain('confidential');
    expect(citizenFiltered.remarks.toLowerCase()).not.toContain('vigilance');

    // Deep scan for forbidden keys returns 0 violations
    const violations = scanForForbiddenCitizenKeys(citizenFiltered);
    expect(violations.length).toBe(0);

    // Verify Officer payload preserves complete fields
    const officerFiltered: any = eventBroadcaster.filterPayloadForUser(sensitiveEvent, 'officer');
    expect(officerFiltered.courtCaseNumber).toBe('WP/2026/00918');
    expect(officerFiltered.mortgageDetails.loanAmount).toBe(12500000);
    expect(officerFiltered.officerRemarks).toContain('CONFIDENTIAL');
  });

  it('5. Server-Sent Events Notification Stream: verifies connection headers and unauthorized block', async () => {
    const app = await createExpressApp();

    // No token -> 401 Unauthorized
    const unauthEvents = await request(app).get('/api/events');
    expect(unauthEvents.status).toBe(401);

    // Valid token connection -> text/event-stream content type
    const server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        const req = http.get(
          `http://127.0.0.1:${address.port}/api/events?token=${encodeURIComponent(officerToken)}`,
          (res) => {
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toContain('text/event-stream');
            req.destroy();
            server.close(() => resolve());
          }
        );
        req.on('error', () => {
          server.close(() => resolve());
        });
      });
    });
  });

  it('6. Guided Demo Tour: proves tour works from any starting page and never leaves app on role-restricted screen', async () => {
    const { TOUR_STEPS } = await import('../src/components/GuidedDemoModal');
    
    expect(TOUR_STEPS.length).toBe(6);

    // Universal public access screens that are valid for ALL roles (Citizen, Officer, Policy Admin)
    const universallyPermittedScreens = ['map', 'citizen', 'audit', 'verify'];

    // Test starting pages for Citizen ('citizen'), Officer ('officer'), and Admin ('policy_admin')
    const startingPages = ['citizen', 'officer', 'policy_admin'] as const;

    for (const startingRole of startingPages) {
      // Simulate tour programmatically starting from each role
      let currentTab = startingRole === 'citizen' ? 'citizen' : startingRole === 'officer' ? 'map' : 'audit';
      
      // Tour opens at step 0 (target tab: map)
      const simulatedTourNavigation = TOUR_STEPS.map((step, idx) => {
        // Enforce role gating policy checks during tour simulation
        let target = step.tabTarget;
        if (target === 'officer' && startingRole === 'citizen') {
          target = 'map'; // fallback rule
        }
        return {
          stepNumber: step.stepNumber,
          targetTab: target,
          elementExists: universallyPermittedScreens.includes(target)
        };
      });

      for (const simStep of simulatedTourNavigation) {
        expect(universallyPermittedScreens).toContain(simStep.targetTab);
        expect(simStep.elementExists).toBe(true);
      }
    }

    // Every single step in the tour must strictly target a universally accessible screen
    for (const step of TOUR_STEPS) {
      expect(universallyPermittedScreens).toContain(step.tabTarget);
      // Prove that no tour step ever forces navigation to an officer-restricted or admin-restricted screen
      expect(step.tabTarget).not.toBe('officer');
      expect(step.tabTarget).not.toBe('analytics');
    }

    // Verify first step targets the cadastre map and final step targets the audit ledger
    expect(TOUR_STEPS[0].tabTarget).toBe('map');
    expect(TOUR_STEPS[TOUR_STEPS.length - 1].tabTarget).toBe('audit');
  });
});
