import { Parcel, RiskRuleFinding } from '../../shared/types';
import { config } from '../config';

/**
 * R5: FAR / Building Height Violation
 */
export function checkR5FarHeightViolation(parcel: Parcel): RiskRuleFinding | null {
  const farUtilized = parcel.zoning.floorAreaRatioUtilized;
  const farAllowed = parcel.zoning.floorAreaRatioAllowed;
  const isFarExceeded = farUtilized > farAllowed;
  const isViolationNotice = parcel.zoning.buildingPermissionStatus === 'Violation Notice Issued';

  if (!isFarExceeded && !isViolationNotice) {
    return null;
  }

  const excessPct = farAllowed > 0 ? Math.round(((farUtilized - farAllowed) / farAllowed) * 100) : 0;

  return {
    ruleId: 'R5',
    severity: excessPct > 20 || isViolationNotice ? 'rose' : 'amber',
    plainReason: isFarExceeded
      ? `Utilized Floor Area Ratio (${farUtilized}) exceeds maximum allowed master-plan FAR (${farAllowed}) by ${excessPct}%.`
      : 'Building Inspectorate has issued an active municipal building bye-law violation notice.',
    params: {
      farAllowed,
      farUtilized,
      excessPct,
      buildingPermissionStatus: parcel.zoning.buildingPermissionStatus
    },
    triggerFields: ['zoning.floorAreaRatioAllowed', 'zoning.floorAreaRatioUtilized', 'zoning.buildingPermissionStatus'],
    responsibleOffice: 'Urban Local Body (ULB) & Town Planning Enforcement Wing',
    evidence: {
      farAllowed,
      farUtilized,
      excessPercentage: excessPct,
      buildingPermissionStatus: parcel.zoning.buildingPermissionStatus
    }
  };
}

/**
 * R6: Duplicate Sale / Conflicting Conveyance within 90 Days
 */
export function checkR6DuplicateSale(parcel: Parcel): RiskRuleFinding | null {
  if (!parcel.sroDeeds || parcel.sroDeeds.length < 2) return null;

  const saleDeeds = parcel.sroDeeds.filter(d => d.deedType === 'SALE_DEED');
  if (saleDeeds.length < 2) return null;

  const sorted = [...saleDeeds].sort((a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const diffMs = Math.abs(new Date(last.registrationDate).getTime() - new Date(first.registrationDate).getTime());
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= config.DUPLICATE_SALE_DAYS) {
    return {
      ruleId: 'R6',
      severity: 'rose',
      plainReason: `Multiple registered conveyances executed to different buyers within ${diffDays} days (${first.buyerName} and ${last.buyerName}), signaling severe duplicate sale risk.`,
      params: {
        diffDays,
        thresholdDays: config.DUPLICATE_SALE_DAYS,
        deedCount: saleDeeds.length
      },
      triggerFields: ['sroDeeds.registrationDate', 'sroDeeds.buyerName', 'sroDeeds.deedType'],
      responsibleOffice: 'Sub-Registrar Office (Inspector General of Registration & Stamps)',
      evidence: {
        deedCount: saleDeeds.length,
        daysBetweenConveyances: diffDays,
        deeds: saleDeeds.map(d => ({
          deedId: d.deedId,
          buyerName: d.buyerName,
          sellerName: d.sellerName,
          registrationDate: d.registrationDate,
          amountInr: d.considerationAmountInr
        }))
      }
    };
  }

  return null;
}

/**
 * R7: Cross-Registry Lien Discrepancy (CERSAI vs SRO)
 */
export function checkR7LienDiscrepancy(parcel: Parcel): RiskRuleFinding | null {
  const activeCersai = parcel.cersaiCharges?.find(c => c.status === 'ACTIVE');
  const hasSroMortgage = parcel.encumbrance.hasMortgage;

  // Case A: CERSAI charge exists, but SRO reports no mortgage
  if (activeCersai && !hasSroMortgage) {
    return {
      ruleId: 'R7',
      severity: 'amber',
      plainReason: `A cross-registry lien discrepancy was detected: CERSAI registers an active ₹${activeCersai.sanctionAmountInr.toLocaleString('en-IN')} charge with ${activeCersai.financialInstitution}, but the Sub-Registrar encumbrance certificate reports Nil mortgage.`,
      params: {
        discrepancyType: 'CERSAI_ACTIVE_BUT_SRO_NIL',
        cersaiChargeId: activeCersai.chargeId
      },
      triggerFields: ['cersaiCharges', 'encumbrance.hasMortgage'],
      responsibleOffice: 'Central Registry (CERSAI) & Sub-Registrar Office',
      evidence: {
        discrepancyType: 'CERSAI_ACTIVE_BUT_SRO_NIL',
        cersaiChargeId: activeCersai.chargeId,
        financialInstitution: activeCersai.financialInstitution,
        sanctionAmountInr: activeCersai.sanctionAmountInr,
        chargeCreationDate: activeCersai.chargeCreationDate,
        sroMortgageReported: false
      }
    };
  }

  // Case B: SRO reports mortgage, but CERSAI has no active charge
  if (!activeCersai && hasSroMortgage && parcel.encumbrance.mortgageDetails) {
    return {
      ruleId: 'R7',
      severity: 'amber',
      plainReason: `A cross-registry lien discrepancy was detected: SRO encumbrance registers a mortgage with ${parcel.encumbrance.mortgageDetails.lenderName}, but no active statutory security charge is on file in CERSAI.`,
      params: {
        discrepancyType: 'SRO_ACTIVE_BUT_CERSAI_MISSING'
      },
      triggerFields: ['encumbrance.hasMortgage', 'cersaiCharges'],
      responsibleOffice: 'Central Registry (CERSAI) & Sub-Registrar Office',
      evidence: {
        discrepancyType: 'SRO_ACTIVE_BUT_CERSAI_MISSING',
        sroLenderName: parcel.encumbrance.mortgageDetails.lenderName,
        sroLoanAmountInr: parcel.encumbrance.mortgageDetails.loanAmountInr,
        cersaiChargesFound: 0
      }
    };
  }

  return null;
}

/**
 * R8: Stale Tax Assessment or Arrears
 */
export function checkR8TaxArrears(parcel: Parcel): RiskRuleFinding | null {
  if (parcel.tax.taxStatus === 'Paid') return null;

  const currentYear = new Date().getFullYear();
  const isStale = (currentYear - parcel.tax.assessmentYear) >= 2;

  return {
    ruleId: 'R8',
    severity: isStale ? 'amber' : 'info',
    plainReason: isStale
      ? `Property tax assessment is stale with outstanding municipal dues of ₹${parcel.tax.annualTaxDemandInr.toLocaleString('en-IN')} pending since financial year ${parcel.tax.assessmentYear}.`
      : `Current fiscal year property tax demand of ₹${parcel.tax.annualTaxDemandInr.toLocaleString('en-IN')} remains unpaid.`,
    params: {
      assessmentYear: parcel.tax.assessmentYear,
      arrearsInr: parcel.tax.annualTaxDemandInr,
      isStale
    },
    triggerFields: ['tax.taxStatus', 'tax.assessmentYear', 'tax.annualTaxDemandInr'],
    responsibleOffice: 'Municipal Corporation (Revenue & Property Tax Assessment Cell)',
    evidence: {
      assessmentNumber: parcel.tax.propertyTaxAssessmentNo,
      assessmentYear: parcel.tax.assessmentYear,
      annualDemandInr: parcel.tax.annualTaxDemandInr,
      taxStatus: parcel.tax.taxStatus,
      lastPaymentDate: parcel.tax.lastPaymentDate || 'Never'
    }
  };
}

/**
 * R9: Ownership Age & Title Chain Lineage
 */
export function checkR9OwnershipAge(parcel: Parcel): RiskRuleFinding | null {
  const regYear = new Date(parcel.ownership.registrationDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const ageYears = currentYear - regYear;

  if (ageYears >= config.OWNERSHIP_AGE_MIN_YEARS) {
    return {
      ruleId: 'R9',
      severity: 'info',
      plainReason: `Title has been continuously registered in the present lineage for ${ageYears} years (since ${regYear}), demonstrating historical title stability.`,
      params: {
        registrationDate: parcel.ownership.registrationDate,
        ageYears,
        baselineYears: config.OWNERSHIP_AGE_MIN_YEARS
      },
      triggerFields: ['ownership.registrationDate'],
      responsibleOffice: 'Directorate of Land Records (Bhoomi / Revenue Department)',
      evidence: {
        registrationDate: parcel.ownership.registrationDate,
        ownershipAgeYears: ageYears,
        titleChainStatus: 'LONG_STANDING_TITLE'
      }
    };
  }

  return null;
}
