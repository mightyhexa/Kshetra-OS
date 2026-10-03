import { Parcel, RiskRuleFinding, WaterbodyRecord } from '../../shared/types';
import { config } from '../config';
import { getIntersectionEvidence, isNearWaterbody, calculateWaterbodyDistanceMeters } from './geo';

/**
 * R1: Active Litigation / Stay Order
 * Returns rose finding if judicial stay or active litigation is on record.
 */
export function checkR1Litigation(parcel: Parcel): RiskRuleFinding | null {
  if (!parcel.encumbrance.disputeFlag) return null;

  const isStay = !!parcel.encumbrance.stayOrderActive;
  return {
    ruleId: 'R1',
    code: 'ACTIVE_STAY_ORDER_LITIGATION',
    severity: 'rose',
    plainReason: isStay
      ? 'An active civil court stay order prohibits any transfer, alienation, or mutation of this parcel.'
      : 'Active court litigation is currently pending on this parcel title in the revenue court docket.',
    params: {
      stayOrderActive: isStay,
      caseNumber: parcel.encumbrance.courtCaseNumber || 'CIV-REG-2026'
    },
    triggerFields: ['encumbrance.disputeFlag', 'encumbrance.stayOrderActive', 'encumbrance.courtCaseNumber'],
    responsibleOffice: 'Revenue Court & Sub-Registrar Judicial Cell',
    evidence: {
      courtCaseNumber: parcel.encumbrance.courtCaseNumber || 'CIV-STAY-2026-091',
      stayOrderDetails: parcel.encumbrance.stayOrderDetails || 'Interim injunction in Title Suit',
      disputeReason: parcel.encumbrance.disputeReason || 'Title challenge pending adjudication'
    }
  };
}

/**
 * R2: Boundary Overlap & Cadastral Encroachment
 * Returns rose finding if overlap > OVERLAP_FLAG_PCT (5%).
 * Returns info finding if between OVERLAP_TOLERANCE_PCT (0.5%) and 5%.
 */
export function checkR2BoundaryOverlap(parcel: Parcel, allParcels: Parcel[]): RiskRuleFinding[] {
  const findings: RiskRuleFinding[] = [];

  for (const other of allParcels) {
    if (other.ulpin === parcel.ulpin) continue;
    if (other.district !== parcel.district) continue;

    const { overlapPct, intersection } = getIntersectionEvidence(parcel.boundaryGeojson, other.boundaryGeojson);

    if (overlapPct > config.OVERLAP_FLAG_PCT) {
      findings.push({
        ruleId: 'R2',
        code: 'CADASTRAL_OVERLAP_SEVERE',
        severity: 'rose',
        plainReason: `Spatial cadastre intersects ${overlapPct}% into adjacent Survey ${other.surveyNumber} (${other.displayUlpin || other.ulpin}), exceeding the statutory boundary tolerance.`,
        params: {
          overlapPct,
          thresholdPct: config.OVERLAP_FLAG_PCT,
          partnerUlpin: other.ulpin
        },
        triggerFields: ['boundaryGeojson', 'spatialIntersectionArea'],
        responsibleOffice: 'Survey Department (Directorate of Survey & Land Records)',
        evidence: {
          partnerUlpin: other.ulpin,
          partnerDisplayUlpin: other.displayUlpin || other.ulpin,
          partnerSurveyNumber: other.surveyNumber,
          overlapPercentage: overlapPct,
          intersectionGeometry: intersection
        }
      });
    } else if (overlapPct >= config.OVERLAP_TOLERANCE_PCT && overlapPct <= config.OVERLAP_FLAG_PCT) {
      findings.push({
        ruleId: 'R2',
        code: 'CADASTRAL_OVERLAP_TOLERANCE',
        severity: 'info',
        plainReason: `Boundary coordinate sliver of ${overlapPct}% with Survey ${other.surveyNumber} is within legacy DILRMP survey tolerance.`,
        params: {
          overlapPct,
          toleranceMaxPct: config.OVERLAP_FLAG_PCT,
          partnerUlpin: other.ulpin
        },
        triggerFields: ['boundaryGeojson'],
        responsibleOffice: 'Survey Department (District Assistant Director of Land Records)',
        evidence: {
          partnerUlpin: other.ulpin,
          partnerDisplayUlpin: other.displayUlpin || other.ulpin,
          partnerSurveyNumber: other.surveyNumber,
          overlapPercentage: overlapPct,
          intersectionGeometry: intersection,
          toleranceStatus: 'WITHIN_LEGACY_SURVEY_TOLERANCE'
        }
      });
    }
  }

  return findings;
}

/**
 * R3: Eco-Buffer / Waterbody Proximity
 * Rose if building permission is granted within 65m; otherwise amber.
 */
export function checkR3EcoBuffer(parcel: Parcel, waterbodies: WaterbodyRecord[]): RiskRuleFinding[] {
  const findings: RiskRuleFinding[] = [];

  for (const wb of waterbodies) {
    if (wb.district !== parcel.district) continue;
    const isNearby = isNearWaterbody(parcel.boundaryGeojson, wb.boundaryGeojson, config.WATERBODY_BUFFER_METERS);
    if (!isNearby) continue;

    const distanceMeters = calculateWaterbodyDistanceMeters(parcel.boundaryGeojson, wb.boundaryGeojson);
    const hasBuildingPermission = parcel.zoning.buildingPermissionStatus === 'Approved';

    findings.push({
      ruleId: 'R3',
      code: 'WATERBODY_NGT_BUFFER_VIOLATION',
      severity: hasBuildingPermission ? 'rose' : 'amber',
      plainReason: hasBuildingPermission
        ? `Building permission was granted within the mandatory ${config.WATERBODY_BUFFER_METERS}m statutory environmental buffer of ${wb.name}, creating severe legal risk under NGT mandates.`
        : `Parcel boundary falls within the ${config.WATERBODY_BUFFER_METERS}-meter statutory buffer of ${wb.name} (${wb.type}), restricting permanent construction.`,
      params: {
        distanceMeters,
        bufferThresholdMeters: config.WATERBODY_BUFFER_METERS,
        waterbodyName: wb.name,
        buildingPermissionStatus: parcel.zoning.buildingPermissionStatus
      },
      triggerFields: ['boundaryGeojson', 'zoning.buildingPermissionStatus'],
      responsibleOffice: 'Town Planning / Lake Protection Authority',
      evidence: {
        waterbodyId: wb.id,
        waterbodyName: wb.name,
        waterbodyType: wb.type,
        distanceMeters,
        bufferStatutoryMeters: config.WATERBODY_BUFFER_METERS,
        buildingPermissionStatus: parcel.zoning.buildingPermissionStatus
      }
    });
  }

  return findings;
}

/**
 * R4: Master Plan Zoning Mismatch
 */
export function checkR4ZoningMismatch(parcel: Parcel): RiskRuleFinding | null {
  if (parcel.zoning.masterPlanClassification === parcel.zoning.registeredLandUse) {
    return null;
  }

  return {
    ruleId: 'R4',
    code: 'ZONING_MISMATCH',
    severity: 'amber',
    plainReason: `Master-plan classification (${parcel.zoning.masterPlanClassification}) differs from registered revenue land use (${parcel.zoning.registeredLandUse}), requiring Change of Land Use (CLU) authorization.`,
    params: {
      masterPlan: parcel.zoning.masterPlanClassification,
      registeredLandUse: parcel.zoning.registeredLandUse
    },
    triggerFields: ['zoning.masterPlanClassification', 'zoning.registeredLandUse'],
    responsibleOffice: 'Town Planning Directorate (Urban Development Authority)',
    evidence: {
      masterPlanClassification: parcel.zoning.masterPlanClassification,
      registeredLandUse: parcel.zoning.registeredLandUse,
      cluRequired: true
    }
  };
}
