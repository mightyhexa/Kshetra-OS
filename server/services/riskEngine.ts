import { Parcel, RiskRuleFinding, UserRole, WaterbodyRecord } from '../../shared/types';
import {
  checkR1Litigation,
  checkR2BoundaryOverlap,
  checkR3EcoBuffer,
  checkR4ZoningMismatch
} from './riskRules';
import {
  checkR5FarHeightViolation,
  checkR6DuplicateSale,
  checkR7LienDiscrepancy,
  checkR8TaxArrears,
  checkR9OwnershipAge
} from './riskRulesMore';

/**
 * Mask sensitive evidence fields for citizen users (Layer 2 data privacy)
 */
export function maskRiskFindingForRole(finding: RiskRuleFinding, role?: UserRole): RiskRuleFinding {
  if (role !== 'citizen') {
    return finding;
  }

  const masked = JSON.parse(JSON.stringify(finding)) as RiskRuleFinding;

  // Mask R1 Court Details
  if (masked.ruleId === 'R1') {
    masked.plainReason = 'An active civil dispute or judicial proceeding is recorded against this property.';
    masked.params = { status: 'DISPUTE_ON_RECORD' };
    masked.evidence = {
      notice: 'Detailed judicial litigation docket numbers are restricted to registered owners and revenue officers.'
    };
  }

  // Mask R7 Banking / Lien Details
  if (masked.ruleId === 'R7') {
    masked.plainReason = 'A cross-registry financial lien discrepancy is recorded for this parcel.';
    masked.params = { discrepancy: true };
    masked.evidence = {
      notice: 'Specific commercial banking lien and sanction amounts are restricted from public citizen view.'
    };
  }

  return masked;
}

/**
 * Evaluates all 9 deterministic risk rules against a parcel.
 * Optionally applies role-based masking on evidence for citizen users.
 */
export function evaluateParcelRisks(
  parcel: Parcel,
  allParcels: Parcel[],
  waterbodies: WaterbodyRecord[] = [],
  role?: UserRole
): RiskRuleFinding[] {
  const findings: RiskRuleFinding[] = [];

  // R1: Active Litigation / Stay Order
  const r1 = checkR1Litigation(parcel);
  if (r1) findings.push(r1);

  // R2: Boundary Overlap
  const r2 = checkR2BoundaryOverlap(parcel, allParcels);
  findings.push(...r2);

  // R3: Eco-Buffer / Waterbody Proximity
  const r3 = checkR3EcoBuffer(parcel, waterbodies);
  findings.push(...r3);

  // R4: Master Plan Zoning Mismatch
  const r4 = checkR4ZoningMismatch(parcel);
  if (r4) findings.push(r4);

  // R5: FAR / Building Height Violation
  const r5 = checkR5FarHeightViolation(parcel);
  if (r5) findings.push(r5);

  // R6: Duplicate Sale in 90 Days
  const r6 = checkR6DuplicateSale(parcel);
  if (r6) findings.push(r6);

  // R7: Cross-Registry Lien Discrepancy (CERSAI vs SRO)
  const r7 = checkR7LienDiscrepancy(parcel);
  if (r7) findings.push(r7);

  // R8: Stale Tax Assessment or Arrears
  const r8 = checkR8TaxArrears(parcel);
  if (r8) findings.push(r8);

  // R9: Ownership Age Baseline
  const r9 = checkR9OwnershipAge(parcel);
  if (r9) findings.push(r9);

  // Apply role masking if citizen
  return findings.map(f => maskRiskFindingForRole(f, role));
}

/**
 * Summary counts & max severity for search/list endpoints
 */
export function summarizeRisks(findings: RiskRuleFinding[]): {
  total: number;
  roseCount: number;
  amberCount: number;
  infoCount: number;
  maxSeverity: 'rose' | 'amber' | 'info' | 'none';
} {
  const roseCount = findings.filter(f => f.severity === 'rose').length;
  const amberCount = findings.filter(f => f.severity === 'amber').length;
  const infoCount = findings.filter(f => f.severity === 'info').length;

  let maxSeverity: 'rose' | 'amber' | 'info' | 'none' = 'none';
  if (roseCount > 0) maxSeverity = 'rose';
  else if (amberCount > 0) maxSeverity = 'amber';
  else if (infoCount > 0) maxSeverity = 'info';

  return {
    total: findings.length,
    roseCount,
    amberCount,
    infoCount,
    maxSeverity
  };
}
