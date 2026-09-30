import React, { useState } from 'react';
import { Parcel } from '../types';
import { auditLedger } from '../services/auditLedger';
import { useAuth } from '../context/AuthContext';
import { X, Scissors, CheckCircle2, ShieldCheck, MapPin, ArrowRight, Layers } from 'lucide-react';

interface CadastralSubdivisionModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CadastralSubdivisionModal: React.FC<CadastralSubdivisionModalProps> = ({
  parcel,
  isOpen,
  onClose
}) => {
  const { currentRole, currentUser } = useAuth();
  const [splitRatio, setSplitRatio] = useState<number>(50); // 50% / 50%
  const [childOwnerA, setChildOwnerA] = useState<string>('');
  const [childOwnerB, setChildOwnerB] = useState<string>('');
  const [subdivisionConfirmed, setSubdivisionConfirmed] = useState(false);
  const [blockHash, setBlockHash] = useState<string | null>(null);

  if (!isOpen || !parcel) return null;

  const totalArea = parcel.areaSqm;
  const areaA = Math.round((totalArea * splitRatio) / 100);
  const areaB = totalArea - areaA;

  const acresA = Number(((parcel.areaAcres * splitRatio) / 100).toFixed(3));
  const acresB = Number((parcel.areaAcres - acresA).toFixed(3));

  const childUlpinA = `${parcel.ulpin}-P1`;
  const childUlpinB = `${parcel.ulpin}-P2`;
  const childSurveyA = `${parcel.surveyNumber}-1`;
  const childSurveyB = `${parcel.surveyNumber}-2`;

  const handleConfirmSubdivision = async (e: React.FormEvent) => {
    e.preventDefault();
    const log = await auditLedger.appendEntry({
      action: 'WORKFLOW_TRANSITION',
      actorRole: currentRole,
      actorName: currentUser.fullName,
      actorId: currentUser.id,
      parcelUlpin: parcel.ulpin,
      details: `Cadastral subdivision sanctioned: Survey ${parcel.surveyNumber} partitioned into ${childSurveyA} (${areaA} sqm) & ${childSurveyB} (${areaB} sqm)`,
      metadataPayload: {
        parentUlpin: parcel.ulpin,
        childUlpinA,
        childUlpinB,
        areaA,
        areaB,
        ownerA: childOwnerA || parcel.ownership.ownerName,
        ownerB: childOwnerB || 'Co-Sharer'
      }
    });

    setBlockHash(log.currentHash);
    setSubdivisionConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#0B3D6E] text-white rounded-lg">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Interactive Cadastral Boundary Partition & Demarcation Tool
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#0B3D6E] font-semibold">
                  Tahsildar Digital Module
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Subdivide survey number, calculate geodesic child extents, and assign Bhu-Aadhaar child ULPINs.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {subdivisionConfirmed ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Cadastral Partition Order Legally Executed & Hashed!
              </h3>
              <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
                Survey {parcel.surveyNumber} has been officially split into two autonomous cadastral records. Both child parcels have been registered into the National Spatial Data Infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs max-w-lg mx-auto bg-white p-3.5 rounded-xl border border-emerald-200">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Child Parcel 1</span>
                <span className="font-bold text-[#0B3D6E]">{childSurveyA}</span>
                <div className="text-[11px] text-slate-700 font-sans mt-1">{areaA} m² ({acresA} acres)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">ULPIN: {childUlpinA}</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Child Parcel 2</span>
                <span className="font-bold text-[#0B3D6E]">{childSurveyB}</span>
                <div className="text-[11px] text-slate-700 font-sans mt-1">{areaB} m² ({acresB} acres)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">ULPIN: {childUlpinB}</div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 bg-white p-2 rounded-lg border border-slate-200 max-w-lg mx-auto truncate">
              SHA-256 Block Digest: {blockHash}
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0B3D6E] hover:bg-[#082a4d] text-white font-semibold text-xs rounded-lg shadow-sm"
            >
              Return to Map & Inspection
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmSubdivision} className="space-y-4 text-xs">
            {/* Parent Parcel Baseline Info */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Parent Survey No.</span>
                <span className="font-bold text-slate-900">{parcel.surveyNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Parent ULPIN</span>
                <span className="font-mono font-semibold text-[#0B3D6E]">{parcel.ulpin}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Cadastral Extent</span>
                <span className="font-bold text-slate-900">{totalArea} m² ({parcel.areaAcres} Acres)</span>
              </div>
            </div>

            {/* Visual Cadastral Polygon Slicing SVG Graphic */}
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Simulated Geodesic Demarcation Slice:
              </span>

              <div className="relative w-full max-w-md h-36 bg-white rounded-lg border border-slate-300 shadow-inner overflow-hidden flex items-center justify-center p-3">
                <svg viewBox="0 0 400 120" className="w-full h-full">
                  {/* Child Polygon A */}
                  <polygon
                    points={`10,15 ${10 + (380 * splitRatio) / 100},15 ${5 + (380 * splitRatio) / 100},105 10,105`}
                    fill="#3B82F6"
                    fillOpacity="0.3"
                    stroke="#1D4ED8"
                    strokeWidth="2"
                  />
                  {/* Child Polygon B */}
                  <polygon
                    points={`${10 + (380 * splitRatio) / 100},15 390,15 390,105 ${5 + (380 * splitRatio) / 100},105`}
                    fill="#10B981"
                    fillOpacity="0.3"
                    stroke="#047857"
                    strokeWidth="2"
                  />
                  {/* Demarcation Cut Line */}
                  <line
                    x1={`${10 + (380 * splitRatio) / 100}`}
                    y1="5"
                    x2={`${5 + (380 * splitRatio) / 100}`}
                    y2="115"
                    stroke="#DC2626"
                    strokeWidth="3"
                    strokeDasharray="4,4"
                  />
                  {/* Text labels */}
                  <text x="40" y="65" fill="#1E40AF" fontWeight="bold" fontSize="12">
                    {childSurveyA} ({areaA} m²)
                  </text>
                  <text x="240" y="65" fill="#065F46" fontWeight="bold" fontSize="12">
                    {childSurveyB} ({areaB} m²)
                  </text>
                </svg>
              </div>

              {/* Slider for Split Ratio */}
              <div className="w-full max-w-md space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span>Sub-Division Ratio:</span>
                  <span className="font-mono text-[#0B3D6E]">{splitRatio}% / {100 - splitRatio}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={splitRatio}
                  onChange={(e) => setSplitRatio(parseInt(e.target.value))}
                  className="w-full accent-[#0B3D6E] cursor-pointer"
                />
              </div>
            </div>

            {/* Child Parcels Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <div className="font-bold text-xs text-[#0B3D6E] flex items-center justify-between">
                  <span>Child Parcel A ({childSurveyA})</span>
                  <span className="font-mono text-[10px]">{areaA} m²</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Assigned Title Holder</label>
                  <input
                    type="text"
                    defaultValue={parcel.ownership.ownerName}
                    onChange={(e) => setChildOwnerA(e.target.value)}
                    placeholder="Owner Full Name"
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  New ULPIN: {childUlpinA}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                <div className="font-bold text-xs text-emerald-800 flex items-center justify-between">
                  <span>Child Parcel B ({childSurveyB})</span>
                  <span className="font-mono text-[10px]">{areaB} m²</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Assigned Co-Sharer / Buyer</label>
                  <input
                    type="text"
                    defaultValue="Legal Heir / Co-Sharer"
                    onChange={(e) => setChildOwnerB(e.target.value)}
                    placeholder="New Title Holder"
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  New ULPIN: {childUlpinB}
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
              Sanctioning this partition will recalculate RoR village survey maps and append an immutable mutation event block into the SHA-256 ledger.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B3D6E] hover:bg-[#082a4d] text-white font-semibold rounded-lg text-xs shadow-sm"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Sanction Cadastral Sub-Division</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
