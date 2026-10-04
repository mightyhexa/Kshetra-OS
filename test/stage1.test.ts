import { describe, it, expect } from 'vitest';
import { generateUlpin, formatUlpin, cleanUlpin, isValidUlpin } from '../shared/ulpin';
import { serializeParcel, scanForForbiddenCitizenKeys } from '../server/services/serializers';
import { buildSeedDatabase } from '../server/repo/seed';
import { evaluateParcelRisks } from '../server/services/riskEngine';
import { verifyChain } from '../server/services/ledgerService';
import { validateTransition, WorkflowTransitionError } from '../server/services/workflowEngine';

describe('STAGE 1: Core Cadastral, Privacy & Integrity Suite', () => {
  // 1. ULPIN derivation & format
  describe('1. Bhu-Aadhaar ULPIN Derivation & Standard Formatting', () => {
    it('generates a valid 14-character alphanumeric ULPIN starting with state code', () => {
      const ulpin = generateUlpin('KA', 12.9818, 77.6205, '142/2A');
      expect(ulpin.length).toBe(14);
      expect(ulpin.startsWith('KA')).toBe(true);
      expect(isValidUlpin(ulpin)).toBe(true);
    });

    it('formats and cleans ULPIN grouped as XX-XXXX-XXXX-XXXX', () => {
      const ulpin = 'KA25AGUFCU4RZ9';
      const formatted = formatUlpin(ulpin);
      expect(formatted).toMatch(/^[A-Z]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      expect(cleanUlpin(formatted)).toBe(ulpin);
    });
  });

  // 2. Seed Database Verification
  describe('2. Canonical Metro Dataset (26 Parcels across 5 Metros)', () => {
    const db = buildSeedDatabase();

    it('contains exactly 26 parcels with specified metro distribution', () => {
      expect(db.parcels.length).toBe(26);
      const metroCounts: Record<string, number> = {};
      db.parcels.forEach(p => { metroCounts[p.district] = (metroCounts[p.district] || 0) + 1; });

      expect(metroCounts['Bengaluru Urban']).toBe(6);
      expect(metroCounts['Hyderabad']).toBe(5);
      expect(metroCounts['Pune']).toBe(5);
      expect(metroCounts['Lucknow']).toBe(5);
      expect(metroCounts['Ahmedabad']).toBe(5);
    });

    it('ensures all 26 parcels have valid 14-char ULPINs and closed polygon coordinates', () => {
      for (const p of db.parcels) {
        expect(isValidUlpin(p.ulpin)).toBe(true);
        expect(p.boundaryGeojson.type).toBe('Polygon');
        expect(p.boundaryGeojson.coordinates.length).toBeGreaterThan(0);
        const ring = p.boundaryGeojson.coordinates[0];
        // Closed ring check
        expect(ring[0][0]).toBeCloseTo(ring[ring.length - 1][0], 4);
        expect(ring[0][1]).toBeCloseTo(ring[ring.length - 1][1], 4);
      }
    });
  });

  // 3. Citizen Role Masking & Deep Key Scans
  describe('3. Citizen Data Privacy & Strict Server-Side Key Stripping', () => {
    const db = buildSeedDatabase();
    const mortgagedParcel = db.parcels.find(p => p.encumbrance.hasMortgage)!;
    const disputedParcel = db.parcels.find(p => p.encumbrance.disputeFlag)!;

    it('physically strips all forbidden keys for citizens (zero violations)', () => {
      const citizenSerialized = serializeParcel(mortgagedParcel, 'citizen');
      const violations = scanForForbiddenCitizenKeys(citizenSerialized);
      expect(violations).toHaveLength(0);
      expect((citizenSerialized as any).encumbrance.mortgageDetails).toBeUndefined();
      expect((citizenSerialized as any).ownership.coOwners).toBeUndefined();
    });

    it('strips judicial court docket and stay order details for citizens', () => {
      const citizenDisputed = serializeParcel(disputedParcel, 'citizen');
      expect((citizenDisputed as any).encumbrance.courtCaseNumber).toBeUndefined();
      expect((citizenDisputed as any).encumbrance.stayOrderDetails).toBeUndefined();
    });

    it('retains complete details for land officer role', () => {
      const officerSerialized = serializeParcel(mortgagedParcel, 'officer');
      expect((officerSerialized as any).encumbrance.mortgageDetails).toBeDefined();
    });
  });

  // 4. Automated Risk Rules (R1 to R9) with ruleId
  describe('4. Risk Rules Detection on Seeded Scenarios', () => {
    const db = buildSeedDatabase();
    const allFindings = db.parcels.flatMap(p => evaluateParcelRisks(p, db.parcels, db.waterbodies));

    it('R1: Finds active litigation / stay orders', () => {
      const stayFindings = allFindings.filter(f => f.ruleId === 'R1');
      expect(stayFindings.length).toBe(4);
      expect(stayFindings[0].severity).toBe('rose');
    });

    it('R2: Finds boundary overlap flag (>5%) and tolerance info (0.3% - 5%)', () => {
      const overlapSevere = allFindings.find(f => f.ruleId === 'R2' && f.severity === 'rose');
      expect(overlapSevere).toBeDefined();
      const overlapTolerance = allFindings.find(f => f.ruleId === 'R2' && f.severity === 'info');
      expect(overlapTolerance).toBeDefined();
    });

    it('R3: Finds exactly 3 parcels in waterbody buffer zone', () => {
      const waterbodyFindings = allFindings.filter(f => f.ruleId === 'R3');
      expect(waterbodyFindings.length).toBe(3);
    });

    it('R4: Finds 2 zoning / land-use mismatches', () => {
      const zoningFindings = allFindings.filter(f => f.ruleId === 'R4');
      expect(zoningFindings.length).toBe(2);
    });

    it('R6: Finds duplicate conveyance within 90 days', () => {
      const dupSale = allFindings.find(f => f.ruleId === 'R6');
      expect(dupSale).toBeDefined();
      expect(dupSale?.severity).toBe('rose');
    });

    it('R7: Finds CERSAI cross-registry lien discrepancy', () => {
      const lien = allFindings.find(f => f.ruleId === 'R7');
      expect(lien).toBeDefined();
      expect(lien?.severity).toBe('amber');
    });

    it('R8: Finds stale tax assessment arrears', () => {
      const taxFinding = allFindings.find(f => f.ruleId === 'R8');
      expect(taxFinding).toBeDefined();
    });
  });

  // 5. Ledger Integrity & Tamper Proofing
  describe('5. Cryptographic Ledger Hash Verification', () => {
    const db = buildSeedDatabase();

    it('verifies pristine seed ledger chain successfully', () => {
      const result = verifyChain(db.ledger);
      expect(result.isValid).toBe(true);
      expect(result.checked).toBeGreaterThan(0);
    });

    it('detects tampering and isolates the exact corrupted block index', () => {
      const tampered = JSON.parse(JSON.stringify(db.ledger));
      tampered[1].details = 'TAMPERED_RECORD';
      const result = verifyChain(tampered);
      expect(result.isValid).toBe(false);
      expect(result.brokenBlockIndex).toBe(1);
    });
  });

  // 6. Workflow Transition State Machine Rules
  describe('6. Workflow Transition Validation', () => {
    it('permits legal transition from Applied to Under Review for officer', () => {
      expect(() => {
        validateTransition('Applied', 'Under Review', 'officer');
      }).not.toThrow();
    });

    it('rejects invalid state jump (Applied -> Approved) with 409 WorkflowTransitionError', () => {
      expect(() => {
        validateTransition('Applied', 'Approved', 'officer');
      }).toThrow(WorkflowTransitionError);
    });

    it('rejects state transition by unauthorized citizen role', () => {
      expect(() => {
        validateTransition('Applied', 'Under Review', 'citizen');
      }).toThrow(WorkflowTransitionError);
    });
  });

  // 7. SQLite Repository Persistence
  describe('7. SQLite Repository Persistence', () => {
    it('persists and retrieves all 26 parcels with relational joins', async () => {
      const { SqliteRepository } = await import('../server/repo/sqliteRepo');
      const repo = new SqliteRepository();
      await repo.init();

      const result = await repo.getParcels();
      expect(result.total).toBe(26);

      const sample = await repo.getParcelByUlpin(result.items[0].ulpin);
      expect(sample).not.toBeNull();
      expect(sample?.ownership.ownerName).toBeDefined();
      expect(sample?.zoning.masterPlanClassification).toBeDefined();
    });
  });
});
