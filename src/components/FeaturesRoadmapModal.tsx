import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Satellite, 
  Compass, 
  FileText, 
  Download, 
  ArrowRight,
  Code2
} from 'lucide-react';

interface FeaturesRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeaturesRoadmapModal: React.FC<FeaturesRoadmapModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'working' | 'roadmap' | 'architecture'>('working');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0B3D6E] text-white rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {t('roadmapTitle')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  {t('winningTierBadge')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t('roadmapSubtitle')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('working')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'working' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('roadmapTabWorking')}</span>
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'roadmap' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t('roadmapTabRoadmap')}</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t('roadmapTabArch')}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {activeTab === 'working' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                <strong>{t('operationalInBuild')}</strong> {t('operationalInBuildDesc')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Feature 1 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dedicated Government Portal Login</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Interactive role selector (Citizen, Land Officer, Policy Admin) with 1-click persona logins, Aadhaar OTP simulation, and "Demo Mode" honesty badges.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real Interactive GIS Map Engine (Leaflet)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    India-centered map with real GeoJSON vector polygon boundaries across 26 parcels in 5 metros (Bengaluru, Hyderabad, Pune, Lucknow, Ahmedabad), with Street vs Satellite orthophoto toggle!
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>3-Tier Cadastral Governance Panel</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Exact PS structure: Base Layer (ULPIN, area, survey, CRS), Essential Layer (RoR, deed no, master plan zoning, encumbrances), and Additional Layer (DISCOM power, water, tax PIDs).
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Server-Side Role-Gating (Layer 2 DoD)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Strict zero-leakage security: Citizen responses physically omit mortgage amounts, lender names, and court dockets at the API controller layer, proven via API Inspector.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Explainable Rule-Based Risk Engine (Layer 3)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Deterministic checks for active court disputes, zoning mismatches, municipal building violations, and 25+ year stale titles with transparent triggered field provenance.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Multi-Agency Workflow State Machine (Layer 4)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Real state machine (Submitted ➔ Under Review ➔ Cross-Verified ➔ Approved/Rejected) with departmental action remarks and live timestamps.
                  </p>
                </div>

                {/* Feature 7 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tamper-Evident SHA-256 Audit Ledger (Layer 0)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Append-only cryptographic blocks with SHA-256 hash chains, built-in chain integrity verification validator, and JSON ledger export.
                  </p>
                </div>

                {/* Feature 8 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Digital Form 15 Certificate Generator</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Printable, official Government Form 15 Encumbrance & Title Search Certificate with digital signature seal and cryptographic ledger block proof.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <strong>Recommendations for High-Grade SIH26014 Enhancements:</strong> These 6 high-value features represent the highest-scoring additions that elevate a hackathon prototype into a ready-to-deploy DPI.
              </div>

              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      1. ISRO Bhuvan Satellite Imagery Temporal Slider (Change Detection)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#0B3D6E] font-semibold">
                      High Impact
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Allows evaluators to slide between 2020 and 2026 satellite imagery orthophotos over a parcel to automatically detect unauthorized construction or boundary encroachment.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      2. Automated Cadastral Boundary Partition / Demarcation Tool
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Included in Demo
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Enables a Tahsildar / Land Officer to digitally subdivide Survey 142/2A into 142/2A-1 and 142/2A-2, recalculating polygon vertices and generating child ULPINs.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      3. Multilingual Voice-First Citizen Assistant (Bhashini Protocol)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                      Inclusion Ready
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Enables rural landowners who may not read English to speak their survey number or village name in Hindi, Kannada, Telugu, or Marathi to listen to their RoR status.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      4. Automated Title Insurance & Bank Loan Underwriting Score
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                      Fintech DPI
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Generates an instant 0–100 Title Clarity Score based on unencumbered duration, dispute absence, and tax payment history, slashing mortgage sanction turnaround from 21 days to 30 seconds.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      5. 3D Cadastre (Vertical Multi-Unit Rights / Strata Titles)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      Advanced GIS
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Models high-rise residential apartments with volumetric 3D bounding cubes, assigning distinct sub-ULPINs to each floor unit with proportionate undivided land share (UDS).
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      6. Smart Contract Mutation on Decoupled Distributed Ledger
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#0B3D6E] font-semibold">
                      Decentralized DPI
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Moves the SHA-256 state machine to a permissioned government consortium node (e.g. Hyperledger Besu) for multi-state tamper proofing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">System Interoperability Architecture</h3>
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-[11px]">
                <div className="flex items-center justify-between border-b pb-1 font-mono">
                  <span className="text-slate-500 font-sans font-semibold">Coordinate Reference System:</span>
                  <span className="text-[#0B3D6E] font-bold">EPSG:4326 (WGS 84 Geodetic Datum)</span>
                </div>
                <div className="flex items-center justify-between border-b pb-1 font-mono">
                  <span className="text-slate-500 font-sans font-semibold">Parcel Identification:</span>
                  <span className="text-[#0B3D6E] font-bold">14-Digit ULPIN (Bhu-Aadhaar Standard)</span>
                </div>
                <div className="flex items-center justify-between border-b pb-1 font-mono">
                  <span className="text-slate-500 font-sans font-semibold">Cryptographic Audit:</span>
                  <span className="text-[#0B3D6E] font-bold">SHA-256 Immutable Hash Chained Blocks</span>
                </div>
                <div className="flex items-center justify-between border-b pb-1 font-mono">
                  <span className="text-slate-500 font-sans font-semibold">GIS Engine:</span>
                  <span className="text-[#0B3D6E] font-bold">Leaflet WebGIS with GeoJSON FeatureLayer</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500 font-sans font-semibold">Role Gating Policy:</span>
                  <span className="text-[#0B3D6E] font-bold">Server-Side JSON Key Stripping (RBAC)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <span className="text-[11px] text-slate-500">
            KSHETRA OS • SIH26014 High-Grade Master Specification
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0B3D6E] hover:bg-[#082a4d] text-white font-semibold rounded-lg text-xs"
          >
            {t('closeMatrix')}
          </button>
        </div>
      </div>
    </div>
  );
};
