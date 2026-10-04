import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { 
  Sparkles, 
  MapPin, 
  Layers, 
  ShieldAlert, 
  FileText, 
  Database, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2,
  Lock,
  UserCheck
} from 'lucide-react';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'map' | 'citizen' | 'officer' | 'audit' | 'verify' | 'analytics') => void;
}

interface TourStep {
  stepNumber: number;
  title: string;
  tabTarget: 'map' | 'citizen' | 'officer' | 'audit' | 'verify' | 'analytics';
  icon: React.ReactNode;
  summary: string;
  details: string;
  actionHint: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    title: '1. Role-Based Access Control & Differential Privacy',
    tabTarget: 'map',
    icon: <UserCheck className="w-6 h-6 text-[#0B3D6E]" />,
    summary: 'Experience strict server-side physical field stripping based on authorized role credentials.',
    details: 'Citizens view verified spatial cadastre and public title records, but sensitive banking mortgage amounts and court stay dockets are physically masked. Revenue Officers receive complete judicial clearances.',
    actionHint: 'Use the top-right Role Selector to switch between Citizen and Land Officer.'
  },
  {
    stepNumber: 2,
    title: '2. 14-Digit Bhu-Aadhaar (ULPIN) Cadastral Search',
    tabTarget: 'map',
    icon: <MapPin className="w-6 h-6 text-emerald-600" />,
    summary: 'Query ISO 19115 compliant alphanumeric geodetic identifiers across 5 metropolitan regions.',
    details: 'Try searching for "KA-2901-7712-4401", "DL-1102-8834-5512", or "MH-2704-5519-8831" to fly directly to urban plots with full geodetic centroid coordinates.',
    actionHint: 'Click on any parcel polygon to slide open the 5-tier Cadastral Record Dossier.'
  },
  {
    stepNumber: 3,
    title: '3. 6 Independent High-Performance Cadastral Layers',
    tabTarget: 'map',
    icon: <Layers className="w-6 h-6 text-indigo-600" />,
    summary: 'Toggle between boundaries, master plan zoning, eco-buffers, and civil court stay hatching.',
    details: 'The cadastre renders with zero watermark OSM and Esri tiles, with statutory 65m lake buffer circles and red overlap intersection polygons.',
    actionHint: 'Open the floating Layers panel to toggle individual thematic spatial layers.'
  },
  {
    stepNumber: 4,
    title: '4. Explainable 9-Rule Automated Anomaly Engine',
    tabTarget: 'map',
    icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
    summary: 'Every cadastral finding includes a plain-language explanation, triggered fields, and responsible office.',
    details: 'Rules automatically detect active litigation stay orders, boundary collisions (>5%), statutory waterbody encroachments, zoning mismatches, and CERSAI lien discrepancies.',
    actionHint: 'Expand any rule card inside the parcel panel to view mathematical evidence.'
  },
  {
    stepNumber: 5,
    title: '5. e-Mutation Filing & Visual SLA Timeline',
    tabTarget: 'citizen',
    icon: <FileText className="w-6 h-6 text-amber-600" />,
    summary: 'Citizens apply for title transfer and receive cryptographically anchored status receipts.',
    details: 'Applications follow statutory stages: Applied -> Under Review -> Cross Verified -> Approved. Officers authorize each step with mandatory justification remarks.',
    actionHint: 'Switch to Citizen Services to submit an e-Mutation application with real PDF upload.'
  },
  {
    stepNumber: 6,
    title: '6. Cryptographic SHA-256 Audit Blockchain & Tamper Proof',
    tabTarget: 'audit',
    icon: <Database className="w-6 h-6 text-[#0B3D6E]" />,
    summary: 'Append-only merkle ledger recording every parcel query, mutation, and certificate issuance.',
    details: 'Click "Verify Integrity" to run real-time hash chaining across all blocks. Policy Administrators can run "Simulate Tampering" to watch the engine isolate corrupted blocks instantly.',
    actionHint: 'Click "Verify Integrity" on the Audit Ledger page to verify all historical blocks.'
  }
];

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const { currentRole } = useAuth();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const step = TOUR_STEPS[currentStepIdx];

  // Whenever demo is opened from ANY starting page, reset to step 0 and navigate to tour start
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      onNavigateTab(TOUR_STEPS[0].tabTarget);
    }
  }, [isOpen]);

  const handleSafeClose = useCallback(() => {
    // Ensure app is never left on an unauthorized screen for current role
    const currentTarget = TOUR_STEPS[currentStepIdx].tabTarget;
    if (currentTarget === 'analytics' && currentRole !== 'policy_admin') {
      onNavigateTab('map');
    } else if (currentTarget === 'officer' && currentRole === 'citizen') {
      onNavigateTab('map');
    }
    onClose();
  }, [currentStepIdx, currentRole, onNavigateTab, onClose]);

  const handleNext = useCallback(() => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      onNavigateTab(TOUR_STEPS[nextIdx].tabTarget);
    } else {
      handleSafeClose();
    }
  }, [currentStepIdx, onNavigateTab, handleSafeClose]);

  const handleBack = useCallback(() => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      onNavigateTab(TOUR_STEPS[prevIdx].tabTarget);
    }
  }, [currentStepIdx, onNavigateTab]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSafeClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handleBack, handleSafeClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="font-serif font-bold text-base text-[#0B3D6E]">
              KSHETRA OS Guided Evaluation Tour
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Step {step.stepNumber} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleSafeClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Close tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 shrink-0">
              {step.icon}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="text-xs text-[#0B3D6E] font-medium mt-0.5">
                {step.summary}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200">
            {step.details}
          </p>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Live Action:</strong> {step.actionHint}</span>
          </div>
        </div>

        {/* Navigation Step Indicators & Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <span
                key={s.stepNumber}
                onClick={() => {
                  setCurrentStepIdx(idx);
                  onNavigateTab(s.tabTarget);
                }}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                  currentStepIdx === idx ? 'bg-[#0B3D6E] w-6' : 'bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Go to step ${s.stepNumber}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSafeClose}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Skip Tour
            </button>

            {currentStepIdx > 0 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={handleBack}
              >
                Back
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={handleNext}
            >
              {currentStepIdx === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
