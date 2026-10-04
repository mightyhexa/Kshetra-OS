import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../server/index';
import { signToken } from '../server/middleware/auth';
import { en } from '../src/i18n/en';
import { hi } from '../src/i18n/hi';
import { kn } from '../src/i18n/kn';

describe('PART 4B Verification: Citizen Services, Officer Console & Admin Analytics', () => {
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

  it('1. Server-Side Role Enforcement: verifies 401 for unauthenticated, 403 for unauthorized roles', async () => {
    const app = await createExpressApp();

    // 1A. No token -> 401
    const unauthStats = await request(app).get('/api/admin/stats');
    expect(unauthStats.status).toBe(401);

    const unauthSelftest = await request(app).get('/api/selftest/selftest');
    expect(unauthSelftest.status).toBe(401);

    // 1B. Citizen token on admin endpoints -> 403 Forbidden
    const citizenStats = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(citizenStats.status).toBe(403);
    expect(citizenStats.body.error.code).toBe('FORBIDDEN');

    const citizenSelftest = await request(app)
      .get('/api/selftest/selftest')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(citizenSelftest.status).toBe(403);
    expect(citizenSelftest.body.error.code).toBe('FORBIDDEN');

    // 1C. Citizen token on officer-only transition and risk-registry endpoints -> 403 Forbidden
    const citizenTransition = await request(app)
      .post('/api/requests/REQ-2026-001/transition')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ nextStatus: 'Under Review', department: 'Land Records & Survey', remarks: 'Illegal attempt' });
    expect(citizenTransition.status).toBe(403);

    const citizenRiskRegistry = await request(app)
      .get('/api/parcels/risks/registry')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(citizenRiskRegistry.status).toBe(403);

    const officerRiskRegistry = await request(app)
      .get('/api/parcels/risks/registry')
      .set('Authorization', `Bearer ${officerToken}`);
    expect(officerRiskRegistry.status).toBe(200);

    // 1D. Officer token on admin-only endpoints -> 403 Forbidden
    const officerStats = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${officerToken}`);
    expect(officerStats.status).toBe(403);

    const officerSelftest = await request(app)
      .get('/api/selftest/selftest')
      .set('Authorization', `Bearer ${officerToken}`);
    expect(officerSelftest.status).toBe(403);
  });

  it('2. Honest /api/selftest: detects active tampering, reports FAIL/DEGRADED, and recovers to PASS/HEALTHY after reset', async () => {
    const app = await createExpressApp();

    // Step A: Pristine baseline -> HEALTHY and all PASS
    const pristineRes = await request(app)
      .get('/api/selftest/selftest')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(pristineRes.status).toBe(200);
    expect(pristineRes.body.data.overallStatus).toBe('HEALTHY');
    expect(pristineRes.body.data.checksPassed).toBe(5);

    // Verify each check row contains real execution latency timing and plain-language details
    for (const check of pristineRes.body.data.checks) {
      expect(typeof check.durationMs).toBe('number');
      expect(check.durationMs).toBeGreaterThanOrEqual(0);
      expect(check.details.length).toBeGreaterThan(10);
    }

    // Step B: Inject deliberate cryptographic tampering via /api/ledger/tamper
    const tamperRes = await request(app)
      .post('/api/ledger/tamper')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(tamperRes.status).toBe(200);

    // Step C: Execute self-test -> LEDGER_INTEGRITY must report FAIL and overallStatus DEGRADED
    const tamperedCheckRes = await request(app)
      .get('/api/selftest/selftest')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(tamperedCheckRes.status).toBe(200);
    expect(tamperedCheckRes.body.data.overallStatus).toBe('DEGRADED');

    const ledgerCheck = tamperedCheckRes.body.data.checks.find((c: any) => c.id === 'LEDGER_INTEGRITY');
    expect(ledgerCheck).toBeDefined();
    expect(ledgerCheck.status).toBe('FAIL');
    expect(ledgerCheck.details.toLowerCase()).toContain('mismatch');

    // Step D: Restore ledger via /api/ledger/reset
    const resetRes = await request(app)
      .post('/api/ledger/reset')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resetRes.status).toBe(200);

    // Step E: Re-run self-test -> returns to 100% PASS and HEALTHY
    const restoredCheckRes = await request(app)
      .get('/api/selftest/selftest')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(restoredCheckRes.status).toBe(200);
    expect(restoredCheckRes.body.data.overallStatus).toBe('HEALTHY');
    expect(restoredCheckRes.body.data.checksPassed).toBe(5);
  });

  it('3. Dictionary Parity: validates 100% dictionary key parity for Stage 4B across en, hi, kn', () => {
    const stage4bKeys = [
      'citizenServicesTitle',
      'citizenServicesSubtitle',
      'applyNewService',
      'selectServiceType',
      'selectParcel',
      'remarksLabel',
      'uploadEvidenceFile',
      'myApplications',
      'officerConsoleTitle',
      'officerConsoleSubtitle',
      'kpiParcelsIndexed',
      'kpiCourtDisputes',
      'kpiHighFlags',
      'kpiTotalFlags',
      'kpiAvgTurnaround',
      'workflowQueueTitle',
      'riskRegistryTitle',
      'authorizeTransition',
      'analyticsTitle',
      'analyticsSubtitle',
      'runSystemCheck',
      'roleRestrictedTitle',
      'roleRestrictedOfficer',
      'roleRestrictedAdmin'
    ];

    for (const k of stage4bKeys) {
      expect((en as any)[k]).toBeDefined();
      expect((hi as any)[k]).toBeDefined();
      expect((kn as any)[k]).toBeDefined();
      expect((en as any)[k].length).toBeGreaterThan(0);
      expect((hi as any)[k].length).toBeGreaterThan(0);
      expect((kn as any)[k].length).toBeGreaterThan(0);
    }
  });
});
