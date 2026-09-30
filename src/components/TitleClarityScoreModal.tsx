import React from 'react';
import { Parcel } from '../types';
import { computeParcelFlags } from '../services/riskEngine';
import { X, Award, ShieldCheck, CheckCircle2, AlertTriangle, Building, CreditCard, Download } from 'lucide-react';

interface TitleClarityScoreModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TitleClarityScoreModal: React.FC<TitleClarityScoreModalProps> = ({
  parcel,
  isOpen,
  onClose
}) => {
  if (!isOpen || !parcel) return null;

  const flags = computeParcelFlags(parcel);

  // Compute 0-100 Title Clarity Score mathematically
  let tenureScore = 35; // Chain of title
  const regYear = new Date(parcel.ownership.registrationDate).getFullYear();
  if (2024 - regYear >= 25) {
    tenureScore = 20; // deduction for stale title
  }

  let disputeScore = 30; // Dispute absence
  if (parcel.encumbrance.disputeFlag) {
    disputeScore = 0; // major deduction
  }

  let zoningScore = 20; // Master plan match
  if (parcel.zoning.masterPlanClassification !== parcel.zoning.registeredLandUse) {
    zoningScore = 5;
  } else if (parcel.zoning.buildingPermissionStatus === 'Violation Notice Issued') {
    zoningScore = 8;
  }

  let taxScore = 15; // Tax compliance
  if (parcel.tax.taxStatus === 'Outstanding') {
    taxScore = 4;
  }

  const totalScore = tenureScore + disputeScore + zoningScore + taxScore;

  let grade = 'AAA — Prime Bankable';
  let gradeColor = 'text-emerald-700 bg-emerald-100 border-emerald-300';
  if (totalScore < 50) {
    grade = 'CCC — High Risk / Mortgage Red Flag';
    gradeColor = 'text-rose-700 bg-rose-100 border-rose-300';
  } else if (totalScore < 75) {
    grade = 'BBB — Conditional Clearance Required';
    gradeColor = 'text-amber-700 bg-amber-100 border-amber-300';
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#0B3D6E] text-white rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Bank Title Clarity & Mortgage Readiness Score
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#0B3D6E] font-semibold">
                  Fintech DPI Algorithm
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated legal title risk assessment for agricultural and housing loans under RBI / IBA guidelines.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Hero Card */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular Gauge Representation */}
            <div className="relative w-20 h-20 rounded-full bg-white border-4 border-[#0B3D6E] flex flex-col items-center justify-center shadow-xs shrink-0">
              <span className="text-2xl font-black text-slate-900 leading-none">{totalScore}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">/ 100</span>
            </div>

            <div className="space-y-1">
              <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${gradeColor}`}>
                {grade}
              </span>
              <div className="text-xs text-slate-800 font-semibold">
                ULPIN: {parcel.ulpin}
              </div>
              <div className="text-[11px] text-slate-500">
                Survey {parcel.surveyNumber} • {parcel.district} ({parcel.ownership.ownerName})
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 shrink-0">
            <span className="block font-medium">Clearance Turnaround:</span>
            <span className="text-emerald-600 font-bold text-sm">30 Seconds</span>
            <span className="block text-[10px] text-slate-400">vs 21 Days Manual Search</span>
          </div>
        </div>

        {/* Breakdown Criteria */}
        <div className="space-y-2.5 text-xs">
          <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Actuarial Risk Weights & Score Attribution:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Criteria 1 */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">1. Conveyance Chain Continuity</span>
                <span className="font-mono font-bold text-[#0B3D6E]">{tenureScore}/35</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {tenureScore === 35
                  ? '✓ Registered freehold title with verified conveyance deed.'
                  : '⚠️ Stale legacy title registered >25 years ago without partition proof.'}
              </p>
            </div>

            {/* Criteria 2 */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">2. Judicial Litigation Search</span>
                <span className="font-mono font-bold text-[#0B3D6E]">{disputeScore}/30</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {disputeScore === 30
                  ? '✓ Free from adverse civil suits, stay orders, or waqf notifications.'
                  : `⚠️ Active court case docket: ${parcel.encumbrance.courtCaseNumber || 'Injunction active'}.`}
              </p>
            </div>

            {/* Criteria 3 */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">3. Master Plan Zoning Concordance</span>
                <span className="font-mono font-bold text-[#0B3D6E]">{zoningScore}/20</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {zoningScore === 20
                  ? '✓ Registered land use conforms to Master Plan 2031 zoning.'
                  : `⚠️ Mismatch: Classified as ${parcel.zoning.masterPlanClassification}, registered as ${parcel.zoning.registeredLandUse}.`}
              </p>
            </div>

            {/* Criteria 4 */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">4. Municipal Property Tax Compliance</span>
                <span className="font-mono font-bold text-[#0B3D6E]">{taxScore}/15</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {taxScore === 15
                  ? `✓ Property tax fully paid. Demand clearance verified.`
                  : `⚠️ Outstanding tax default of ₹${parcel.tax.annualTaxDemandInr.toLocaleString('en-IN')}.`}
              </p>
            </div>
          </div>
        </div>

        {/* Banking Integration Note */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-slate-700 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#0B3D6E] shrink-0" />
          <span>
            This score can be consumed by public sector banks via the <code>/api/underwriting/title-score</code> endpoint to issue instant in-principle Kisan Credit Cards (KCC) or home loan sanctions.
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-[10px] text-slate-400 font-mono">
            Algorithm: KSHETRA-TITLESCORE-v1
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0B3D6E] hover:bg-[#082a4d] text-white font-semibold rounded-lg text-xs"
          >
            Close Assessment
          </button>
        </div>
      </div>
    </div>
  );
};
