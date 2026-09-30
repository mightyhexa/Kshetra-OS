import React, { useState } from 'react';
import { Parcel, ParcelRiskFlag, UserRole } from '../types';
import { computeParcelFlags } from '../services/riskEngine';
import { generateParcelPdfReport } from '../services/pdfReportGenerator';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  Building, 
  FileCheck, 
  AlertTriangle, 
  Lock, 
  CheckCircle, 
  Zap, 
  Droplet, 
  Receipt, 
  ArrowRight, 
  Download,
  FileText,
  ChevronDown, 
  ChevronUp, 
  Info
} from 'lucide-react';

interface ParcelDetailPanelProps {
  parcel: Parcel | null;
  userRole: UserRole;
  onClose: () => void;
  onInitiateServiceRequest: (ulpin: string) => void;
  onOpenApiInspector: () => void;
  onGenerateCertificate: (parcel: Parcel) => void;
  onOpenVoiceAssistant?: (parcel: Parcel) => void;
  onOpenSubdivision?: (parcel: Parcel) => void;
  onOpenChangeDetection?: (parcel: Parcel) => void;
  onOpenTitleScore?: (parcel: Parcel) => void;
  onOpenDossier?: (parcel: Parcel) => void;
}

export const ParcelDetailPanel: React.FC<ParcelDetailPanelProps> = ({
  parcel,
  userRole,
  onClose,
  onInitiateServiceRequest,
  onOpenApiInspector,
  onGenerateCertificate,
  onOpenVoiceAssistant,
  onOpenSubdivision,
  onOpenChangeDetection,
  onOpenTitleScore,
  onOpenDossier
}) => {
  const [activeTier, setActiveTier] = useState<'base' | 'essential' | 'additional'>('base');
  const [expandedFlagIndex, setExpandedFlagIndex] = useState<number | null>(0);

  if (!parcel) return null;

  const flags: ParcelRiskFlag[] = computeParcelFlags(parcel);
  const isOfficerOrAdmin = userRole === 'officer' || userRole === 'policy_admin';

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Panel Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#0B3D6E]">
                ULPIN: {parcel.ulpin}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-medium">
                Sample Record
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Survey No. {parcel.surveyNumber} • {parcel.villageWard}
            </h2>
            <p className="text-xs text-slate-500">
              {parcel.subDistrictTaluk}, {parcel.district}, {parcel.state} — {parcel.pincode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-Grade DPI Action Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 -mx-1 px-1 scrollbar-none border-t border-slate-200/60 mt-2">
          {onOpenVoiceAssistant && (
            <button
              onClick={() => onOpenVoiceAssistant(parcel)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-semibold rounded-md border border-slate-200 shadow-2xs whitespace-nowrap transition-colors"
              title="Listen to RoR in Hindi / Kannada"
            >
              <span>🔊 Voice RoR</span>
            </button>
          )}

          {onOpenTitleScore && (
            <button
              onClick={() => onOpenTitleScore(parcel)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-semibold rounded-md border border-slate-200 shadow-2xs whitespace-nowrap transition-colors"
              title="View Bank Mortgage Title Score"
            >
              <span>⭐ Title Score (0-100)</span>
            </button>
          )}

          {onOpenChangeDetection && (
            <button
              onClick={() => onOpenChangeDetection(parcel)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-semibold rounded-md border border-slate-200 shadow-2xs whitespace-nowrap transition-colors"
              title="Compare 2021 vs 2024 satellite imagery"
            >
              <span>🛰️ Satellite AI Change</span>
            </button>
          )}

          {onOpenSubdivision && (
            <button
              onClick={() => onOpenSubdivision(parcel)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-semibold rounded-md border border-slate-200 shadow-2xs whitespace-nowrap transition-colors"
            >
              <span>✂️ Partition Survey</span>
            </button>
          )}

          {onOpenDossier && (
            <button
              onClick={() => onOpenDossier(parcel)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-md shadow-2xs whitespace-nowrap transition-colors"
            >
              <span>📋 NSDI Dossier</span>
            </button>
          )}

          <button
            onClick={() => onGenerateCertificate(parcel)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0B3D6E] text-[11px] font-semibold rounded-md border border-blue-200 shadow-2xs whitespace-nowrap transition-colors"
          >
            <span>📄 Form 15 Cert</span>
          </button>

          <button
            onClick={() => {
              if (onOpenDossier) onOpenDossier(parcel);
              else generateParcelPdfReport(parcel, userRole);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md shadow-2xs whitespace-nowrap transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Explainable Flags & Alerts Banner */}
        {flags.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {flags.map((flag, idx) => {
              const isExpanded = expandedFlagIndex === idx;
              return (
                <div
                  key={flag.code}
                  className={`border rounded-lg text-xs transition-colors ${
                    flag.severity === 'high'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : flag.severity === 'medium'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <button
                    onClick={() => setExpandedFlagIndex(isExpanded ? null : idx)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{flag.title}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-2.5 pt-1 border-t border-slate-200/40 text-[11px] space-y-1.5">
                      <p className="text-slate-700">{flag.reason}</p>
                      <div className="bg-white/80 p-2 rounded border border-slate-200 font-mono text-[10px] space-y-0.5">
                        <div className="font-semibold text-slate-500">Explainable Trigger Fields:</div>
                        {flag.triggeredFields.map((field, fIdx) => (
                          <div key={fIdx} className="text-slate-800">• {field}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tier Tabs (Base / Essential / Additional) */}
        <div className="grid grid-cols-3 gap-1 mt-4 p-1 bg-slate-200/70 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTier('base')}
            className={`py-1.5 rounded-md transition-all text-center ${
              activeTier === 'base'
                ? 'bg-white text-[#0B3D6E] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Base Layer
          </button>
          <button
            onClick={() => setActiveTier('essential')}
            className={`py-1.5 rounded-md transition-all text-center ${
              activeTier === 'essential'
                ? 'bg-white text-[#0B3D6E] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Essential Layers
          </button>
          <button
            onClick={() => setActiveTier('additional')}
            className={`py-1.5 rounded-md transition-all text-center ${
              activeTier === 'additional'
                ? 'bg-white text-[#0B3D6E] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Additional Layers
          </button>
        </div>
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TIER 1: BASE LAYER */}
        {activeTier === 'base' && (
          <div className="space-y-4 text-xs">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-[#0B3D6E]" />
                Spatial Identity & Geodesic Dimensions
              </h3>
              
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block">ULPIN Identifier</span>
                  <span className="font-mono font-medium text-slate-900">{parcel.ulpin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Survey / Khasra No.</span>
                  <span className="font-medium text-slate-900">{parcel.surveyNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Cadastral Area</span>
                  <span className="font-medium text-slate-900">
                    {parcel.areaSqm.toLocaleString('en-IN')} m² ({parcel.areaAcres} acres)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Centroid Coordinates</span>
                  <span className="font-mono text-slate-800">
                    {parcel.centroidLat.toFixed(5)}°N, {parcel.centroidLon.toFixed(5)}°E
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">CRS / Projection Standard</span>
                  <span className="font-medium text-slate-900">EPSG:4326 (WGS 84 Standard)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Polygon Boundary Type</span>
                  <span className="font-medium text-slate-900">GeoJSON Closed Ring ({parcel.boundaryGeojson.coordinates[0].length - 1} vertices)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider text-slate-500">
                Administrative Jurisdiction
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block">State</span>
                  <span className="font-medium text-slate-900">{parcel.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">District</span>
                  <span className="font-medium text-slate-900">{parcel.district}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Taluk / Tehsil</span>
                  <span className="font-medium text-slate-900">{parcel.subDistrictTaluk}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Village / Revenue Ward</span>
                  <span className="font-medium text-slate-900">{parcel.villageWard}</span>
                </div>
              </div>
            </div>

            {/* Raw Polygon Coordinates Viewer */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Cadastral Boundary GeoJSON Ring:
              </span>
              <pre className="text-[10px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto max-h-28">
                {JSON.stringify(parcel.boundaryGeojson.coordinates[0], null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* TIER 2: ESSENTIAL LAYERS */}
        {activeTier === 'essential' && (
          <div className="space-y-4 text-xs">
            {/* Record of Rights (RoR) */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                  <FileCheck className="w-3.5 h-3.5 text-[#0B3D6E]" />
                  Record of Rights (RoR) & Ownership
                </h3>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  parcel.ownership.registrationStatus === 'Registered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {parcel.ownership.registrationStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="col-span-2">
                  <span className="text-slate-400 block">Primary Title Holder</span>
                  <span className="font-semibold text-slate-900 text-sm">{parcel.ownership.ownerName}</span>
                </div>
                {parcel.ownership.coOwners && parcel.ownership.coOwners.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Co-Sharers / Joint Owners</span>
                    <span className="text-slate-700 font-medium">{parcel.ownership.coOwners.join(', ')}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block">Tenure / Ownership Type</span>
                  <span className="font-medium text-slate-900">{parcel.ownership.ownershipType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Registration Date</span>
                  <span className="font-medium text-slate-900">{parcel.ownership.registrationDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Conveyance Deed No.</span>
                  <span className="font-mono text-slate-800">{parcel.ownership.documentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sub-Registrar Office (SRO)</span>
                  <span className="font-medium text-slate-900">{parcel.ownership.subRegistrarOffice}</span>
                </div>
              </div>
            </div>

            {/* Master Plan & Zoning */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                <Building className="w-3.5 h-3.5 text-[#0B3D6E]" />
                Master Plan Classification & Zoning
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block">Master Plan Zoning</span>
                  <span className="font-semibold text-slate-900">{parcel.zoning.masterPlanClassification}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Registered Land Use</span>
                  <span className={`font-semibold ${
                    parcel.zoning.masterPlanClassification !== parcel.zoning.registeredLandUse
                      ? 'text-rose-600 font-bold'
                      : 'text-slate-900'
                  }`}>
                    {parcel.zoning.registeredLandUse}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Building Permission</span>
                  <span className={`font-medium ${
                    parcel.zoning.buildingPermissionStatus === 'Violation Notice Issued'
                      ? 'text-rose-600 font-semibold'
                      : 'text-slate-900'
                  }`}>
                    {parcel.zoning.buildingPermissionStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Permissible FAR</span>
                  <span className="font-medium text-slate-900">{parcel.zoning.floorAreaRatioAllowed}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Max Permissible Height</span>
                  <span className="font-medium text-slate-900">{parcel.zoning.maxBuildingHeightMeters} meters</span>
                </div>
              </div>
            </div>

            {/* Encumbrance / Mortgage (Role-Gated!) */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-[#0B3D6E]" />
                  Encumbrance & Mortgage Registry
                </h3>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  parcel.encumbrance.hasMortgage
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {parcel.encumbrance.hasMortgage ? 'Encumbered' : 'Nil Encumbrance'}
                </span>
              </div>

              {/* CITIZEN ROLE VIEW: Masked */}
              {!isOfficerOrAdmin ? (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Encumbrance Status: <strong className="text-slate-900">{parcel.encumbrance.hasMortgage ? 'Yes (Mortgage Registered)' : 'No (Clear Title)'}</strong>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
                    <p className="font-medium text-slate-700">Data Privacy & Role-Gating Notice:</p>
                    <p>
                      Detailed mortgage banking particulars (loan amount, charge holder, charge ID) are restricted to authorized Land Officers under SIH26014 role governance.
                    </p>
                    <button
                      onClick={onOpenApiInspector}
                      className="mt-1 text-blue-700 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                    >
                      Compare Citizen vs Officer API Response in Sandbox →
                    </button>
                  </div>
                </div>
              ) : (
                /* OFFICER / POLICY ADMIN VIEW: Full Unrestricted Records */
                <div className="space-y-3">
                  <div className="p-2.5 bg-blue-50/60 rounded-md border border-blue-200 text-[11px] text-[#0B3D6E] font-medium">
                    Officer Privileges Active: Full mortgage charges and judicial court case files unlocked.
                  </div>

                  {parcel.encumbrance.hasMortgage && parcel.encumbrance.mortgageDetails ? (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-400 block">Lender / Financial Institution</span>
                        <span className="font-semibold text-slate-900">{parcel.encumbrance.mortgageDetails.lenderName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Sanctioned Charge Amount</span>
                        <span className="font-bold text-slate-900">
                          ₹{parcel.encumbrance.mortgageDetails.loanAmountInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Sanction Date</span>
                        <span className="font-medium text-slate-900">{parcel.encumbrance.mortgageDetails.sanctionDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">CERSAI / Registrar Charge ID</span>
                        <span className="font-mono text-slate-800">{parcel.encumbrance.mortgageDetails.chargeId}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600">No active mortgage charge registered on this parcel.</p>
                  )}

                  {parcel.encumbrance.disputeFlag && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Judicial Litigation Details
                      </div>
                      <p>{parcel.encumbrance.disputeReason}</p>
                      {parcel.encumbrance.courtCaseNumber && (
                        <div className="text-[10px] font-mono text-rose-800">
                          Case Docket: {parcel.encumbrance.courtCaseNumber} • Stay Order: {parcel.encumbrance.stayOrderActive ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TIER 3: ADDITIONAL LAYERS */}
        {activeTier === 'additional' && (
          <div className="space-y-4 text-xs">
            {/* Linked Utilities */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                <Zap className="w-3.5 h-3.5 text-[#0B3D6E]" />
                Linked Public Utility Connections
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block">Power Connection ID</span>
                  <span className="font-mono font-medium text-slate-900">{parcel.utilities.electricityConsumerId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Electricity DISCOM</span>
                  <span className="font-medium text-slate-900">{parcel.utilities.electricityDiscom}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Water Board Consumer ID</span>
                  <span className="font-mono font-medium text-slate-900">{parcel.utilities.waterSupplyConnectionId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Piped Natural Gas (PNG)</span>
                  <span className="font-medium text-slate-900">{parcel.utilities.pipelineGasStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Public Road ROW Width</span>
                  <span className="font-medium text-slate-900">{parcel.utilities.roadAccessWidthMeters} meters</span>
                </div>
              </div>
            </div>

            {/* Property Tax Status */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                  <Receipt className="w-3.5 h-3.5 text-[#0B3D6E]" />
                  Fiscal Assessment & Property Tax
                </h3>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  parcel.tax.taxStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : parcel.tax.taxStatus === 'Outstanding'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {parcel.tax.taxStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block">Tax Assessment PID</span>
                  <span className="font-mono font-medium text-slate-900">{parcel.tax.propertyTaxAssessmentNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Last Assessed Capital Value</span>
                  <span className="font-bold text-slate-900">
                    ₹{parcel.tax.lastAssessedValueInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Annual Demand</span>
                  <span className="font-medium text-slate-900">
                    ₹{parcel.tax.annualTaxDemandInr.toLocaleString('en-IN')}
                  </span>
                </div>
                {parcel.tax.lastPaymentDate && (
                  <div>
                    <span className="text-slate-400 block">Last Receipt Date</span>
                    <span className="font-medium text-slate-900">{parcel.tax.lastPaymentDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel Bottom Action Drawer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onOpenDossier && (
            <button
              onClick={() => onOpenDossier(parcel)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>NSDI Dossier</span>
            </button>
          )}
          <button
            onClick={() => generateParcelPdfReport(parcel, userRole)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={() => onGenerateCertificate(parcel)}
            className="text-xs text-[#0B3D6E] font-semibold hover:underline"
          >
            Form 15
          </button>
        </div>

        <button
          onClick={() => onInitiateServiceRequest(parcel.ulpin)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B3D6E] hover:bg-[#082a4d] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <span>Initiate Service Request</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
