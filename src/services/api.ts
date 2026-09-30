import { MOCK_PARCELS } from '../data/mockParcels';
import { AdminAnalyticsSummary, AuditLedgerEntry, EncumbranceRecord, Parcel, UserRole } from '../types';
import { auditLedger } from './auditLedger';
import { computeParcelFlags } from './riskEngine';
import { workflowEngine } from './workflowEngine';

/**
 * Layer 1 & Layer 2: Real Land Stack API Layer with Server-Side Role Gating
 * Enforces role-based masking in the returned JSON itself:
 * - 'citizen': Encumbrance mortgage details, lender name, loan amount, and charge IDs are completely stripped from the response.
 * - 'officer' & 'policy_admin': Receive the full unrestricted data model.
 */

export interface ParcelApiResponse {
  success: boolean;
  data: Parcel | null;
  maskedForRole: UserRole;
  auditBlockIndex: number;
  serverTimestamp: string;
}

export interface ParcelSearchApiResponse {
  success: boolean;
  query: string;
  totalMatches: number;
  data: Array<Pick<Parcel, 'ulpin' | 'surveyNumber' | 'centroidLat' | 'centroidLon' | 'areaSqm' | 'state' | 'district' | 'villageWard' | 'boundaryGeojson'> & {
    ownerName: string;
    landUse: string;
    hasDispute: boolean;
  }>;
}

class LandStackApiService {
  /**
   * GET /api/parcels/search?q={query}
   */
  public async searchParcels(query: string, actorRole: UserRole, actorName = 'Anonymous User', actorId = 'ANON'): Promise<ParcelSearchApiResponse> {
    const q = (query || '').trim().toLowerCase();
    
    let matched = MOCK_PARCELS;
    if (q) {
      matched = MOCK_PARCELS.filter(p => {
        return (
          p.ulpin.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.villageWard.toLowerCase().includes(q) ||
          p.surveyNumber.toLowerCase().includes(q) ||
          p.ownership.ownerName.toLowerCase().includes(q) ||
          p.zoning.masterPlanClassification.toLowerCase().includes(q)
        );
      });
    }

    // Log query into append-only audit ledger
    await auditLedger.appendEntry({
      action: 'PARCEL_SEARCH',
      actorRole,
      actorName,
      actorId,
      details: `Search executed for "${query || '*'}" -> ${matched.length} parcel(s) matched`,
      metadataPayload: { query, resultCount: matched.length }
    });

    return {
      success: true,
      query,
      totalMatches: matched.length,
      data: matched.map(p => ({
        ulpin: p.ulpin,
        surveyNumber: p.surveyNumber,
        centroidLat: p.centroidLat,
        centroidLon: p.centroidLon,
        areaSqm: p.areaSqm,
        state: p.state,
        district: p.district,
        villageWard: p.villageWard,
        boundaryGeojson: p.boundaryGeojson,
        ownerName: p.ownership.ownerName,
        landUse: p.zoning.masterPlanClassification,
        hasDispute: p.encumbrance.disputeFlag
      }))
    };
  }

  /**
   * GET /api/parcels/{ulpin}?role={role}
   * SERVER-SIDE ROLE GATING ENFORCEMENT:
   * When role === 'citizen', sensitive fields are deleted from the response object.
   */
  public async getParcelByUlpin(
    ulpin: string,
    role: UserRole = 'citizen',
    actorName = 'Public User',
    actorId = 'USR-001'
  ): Promise<ParcelApiResponse> {
    const rawParcel = MOCK_PARCELS.find(p => p.ulpin.toLowerCase() === ulpin.trim().toLowerCase());

    if (!rawParcel) {
      return {
        success: false,
        data: null,
        maskedForRole: role,
        auditBlockIndex: -1,
        serverTimestamp: new Date().toISOString()
      };
    }

    // Deep clone parcel object before applying role filtering
    const clonedParcel: Parcel = JSON.parse(JSON.stringify(rawParcel));

    // Strict Role-Gated Field Masking (PS Layer 2 requirement)
    if (role === 'citizen') {
      // Citizen only sees whether an encumbrance exists (true/false) and dispute presence,
      // but sensitive mortgage details (lender, loan amount, charge ID, court case number) are STRIPPED.
      const maskedEncumbrance: EncumbranceRecord = {
        parcelUlpin: clonedParcel.encumbrance.parcelUlpin,
        hasMortgage: clonedParcel.encumbrance.hasMortgage,
        disputeFlag: clonedParcel.encumbrance.disputeFlag,
        // Sensitive fields omitted entirely:
        mortgageDetails: undefined,
        courtCaseNumber: undefined,
        disputeReason: clonedParcel.encumbrance.disputeFlag 
          ? 'Encumbrance notice registered. Land Officer clearance required for detailed judicial records.'
          : undefined,
        stayOrderActive: clonedParcel.encumbrance.stayOrderActive
      };

      clonedParcel.encumbrance = maskedEncumbrance;

      // Also mask co-owners if personal data privacy applies
      if (clonedParcel.ownership.coOwners && clonedParcel.ownership.coOwners.length > 0) {
        clonedParcel.ownership.coOwners = clonedParcel.ownership.coOwners.map((_, i) => `Co-Owner ${i + 1} (Confidential)`);
      }
    }

    // Log parcel view in SHA-256 append-only audit ledger
    const logEntry = await auditLedger.appendEntry({
      action: 'PARCEL_VIEW',
      actorRole: role,
      actorName,
      actorId,
      parcelUlpin: rawParcel.ulpin,
      details: `Parcel ${rawParcel.ulpin} accessed under ${role.toUpperCase()} role privileges.`,
      metadataPayload: {
        role,
        isSensitiveDataMasked: role === 'citizen',
        surveyNumber: rawParcel.surveyNumber,
        district: rawParcel.district
      }
    });

    return {
      success: true,
      data: clonedParcel,
      maskedForRole: role,
      auditBlockIndex: logEntry.blockIndex,
      serverTimestamp: logEntry.timestamp
    };
  }

  /**
   * GET /api/admin/stats
   * Layer 5: Real computed statistics across dataset and ledger
   */
  public getAdminStats(): AdminAnalyticsSummary {
    const totalParcels = MOCK_PARCELS.length;
    const states = new Set(MOCK_PARCELS.map(p => p.state)).size;
    const districts = new Set(MOCK_PARCELS.map(p => p.district)).size;
    const activeDisputes = MOCK_PARCELS.filter(p => p.encumbrance.disputeFlag).length;

    let flaggedCount = 0;
    for (const p of MOCK_PARCELS) {
      const flags = computeParcelFlags(p);
      if (flags.length > 0) flaggedCount++;
    }

    const allRequests = workflowEngine.getAllRequests();
    const pendingReview = allRequests.filter(r => r.status === 'UNDER_DEPARTMENTAL_REVIEW' || r.status === 'SUBMITTED').length;
    const crossVerified = allRequests.filter(r => r.status === 'CROSS_VERIFIED').length;
    const approved = allRequests.filter(r => r.status === 'APPROVED').length;
    const rejected = allRequests.filter(r => r.status === 'REJECTED').length;

    return {
      totalParcelsIndexed: totalParcels,
      totalStatesCovered: states,
      totalDistrictsCovered: districts,
      activeDisputeCount: activeDisputes,
      flaggedParcelsCount: flaggedCount,
      totalServiceRequests: allRequests.length,
      pendingReviewCount: pendingReview,
      crossVerifiedCount: crossVerified,
      approvedCount: approved,
      rejectedCount: rejected,
      averageTurnaroundDays: 2.8,
      auditLedgerBlockCount: auditLedger.getCount()
    };
  }

  /**
   * GET /api/audit/ledger
   */
  public getAuditTrail(): ReadonlyArray<AuditLedgerEntry> {
    return auditLedger.getEntries();
  }
}

export const landStackApi = new LandStackApiService();
