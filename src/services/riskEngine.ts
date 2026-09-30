import { Parcel, ParcelRiskFlag } from '../types';

/**
 * Layer 3: Explainable Rule-Based Land Governance Risk Engine
 * Every flag is deterministic, transparent, and maps directly to verified data fields.
 * SIH26014 Standard: No black-box AI scores without explainable field provenance.
 */

export function computeParcelFlags(parcel: Parcel): ParcelRiskFlag[] {
  const flags: ParcelRiskFlag[] = [];

  // Rule 1: Active Judicial or Boundary Dispute
  if (parcel.encumbrance.disputeFlag) {
    flags.push({
      code: 'DISPUTE_ACTIVE',
      severity: 'high',
      title: 'Active Dispute / Litigation Flag',
      reason: parcel.encumbrance.disputeReason 
        ? `${parcel.encumbrance.disputeReason}${parcel.encumbrance.courtCaseNumber ? ` [Case: ${parcel.encumbrance.courtCaseNumber}]` : ''}`
        : 'Active litigation or adverse claim registered against this parcel.',
      triggeredFields: [
        'encumbrance.disputeFlag (true)',
        `encumbrance.disputeReason ("${parcel.encumbrance.disputeReason || 'Unspecified'}")`,
        `encumbrance.courtCaseNumber ("${parcel.encumbrance.courtCaseNumber || 'N/A'}")`,
        `encumbrance.stayOrderActive (${parcel.encumbrance.stayOrderActive ? 'true' : 'false'})`
      ]
    });
  }

  // Rule 2: Cadastral Zoning Mismatch (Master Plan vs Registered Land Use)
  if (parcel.zoning.masterPlanClassification !== parcel.zoning.registeredLandUse) {
    flags.push({
      code: 'ZONING_MISMATCH',
      severity: 'high',
      title: 'Master Plan Zoning Inconsistency',
      reason: `Zoning classification is designated as "${parcel.zoning.masterPlanClassification}", but the parcel was registered for "${parcel.zoning.registeredLandUse}" use. Potential non-conforming occupancy or CLU conversion violation.`,
      triggeredFields: [
        `zoning.masterPlanClassification ("${parcel.zoning.masterPlanClassification}")`,
        `zoning.registeredLandUse ("${parcel.zoning.registeredLandUse}")`
      ]
    });
  }

  // Rule 3: Building Permission Violation / In Review
  if (parcel.zoning.buildingPermissionStatus === 'Violation Notice Issued') {
    flags.push({
      code: 'BUILDING_VIOLATION',
      severity: 'medium',
      title: 'Municipal Building Code Violation',
      reason: 'Municipal planning authority has issued an active notice for FAR violation or unapproved structural development.',
      triggeredFields: [
        `zoning.buildingPermissionStatus ("${parcel.zoning.buildingPermissionStatus}")`,
        `zoning.floorAreaRatioAllowed (${parcel.zoning.floorAreaRatioAllowed})`
      ]
    });
  }

  // Rule 4: Stale Registration (Ancestral / Un-mutated Record older than 25 years without recent transaction)
  const regYear = new Date(parcel.ownership.registrationDate).getFullYear();
  const currentYear = new Date().getFullYear(); // Dynamic calculation for current year (2026)
  if (currentYear - regYear >= 25 && parcel.ownership.ownershipType !== 'Government') {
    flags.push({
      code: 'STALE_REGISTRATION',
      severity: 'low',
      title: 'Legacy Title / Stale Cadastral Registry',
      reason: `Last formal conveyance was registered ${currentYear - regYear} years ago (${parcel.ownership.registrationDate}). High likelihood of unrecorded successions, partition deeds, or legal-heir claims.`,
      triggeredFields: [
        `ownership.registrationDate ("${parcel.ownership.registrationDate}")`,
        `calculatedAgeYears (${currentYear - regYear} >= threshold 25)`,
        `ownership.ownershipType ("${parcel.ownership.ownershipType}")`
      ]
    });
  }

  // Rule 5: Outstanding Property Tax Default
  if (parcel.tax.taxStatus === 'Outstanding') {
    flags.push({
      code: 'TAX_DEFAULT',
      severity: 'medium',
      title: 'Property Tax Arrears',
      reason: `Municipal property tax is outstanding. Accumulated demand: ₹${parcel.tax.annualTaxDemandInr.toLocaleString('en-IN')}.`,
      triggeredFields: [
        `tax.taxStatus ("${parcel.tax.taxStatus}")`,
        `tax.annualTaxDemandInr (₹${parcel.tax.annualTaxDemandInr})`,
        `tax.propertyTaxAssessmentNo ("${parcel.tax.propertyTaxAssessmentNo}")`
      ]
    });
  }

  return flags;
}
