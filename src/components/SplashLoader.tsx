import React, { useEffect, useState } from 'react';
import { ShieldCheck, Compass, CheckCircle2, Terminal } from 'lucide-react';
import { KshetraMark } from './KshetraMark';

interface SplashLoaderProps {
  onComplete: () => void;
}

const BOOT_STEPS = [
  'Initializing National Spatial Geodetic Engine (EPSG:4326)...',
  'Connecting Bhuvan / ISRO Geospatial SDI Satellite Feeds...',
  'Synchronizing ULPIN 14-Digit Bhu-Aadhaar Resolvers...',
  'Verifying SHA-256 Cryptographic Tamper-Evident Ledger...',
  'Loading 26 Cadastral Vector Shards across 5 Metros...',
  'Enforcing Zero-Trust Role-Based Access Control (RBAC)...',
  'KSHETRA OS Ready. Launching Public Infrastructure Node.'
];

export const SplashLoader: React.FC<SplashLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // If user has already visited in this session, complete immediately
    if (sessionStorage.getItem('kshetra_booted')) {
      onComplete();
      return;
    }

    const totalDuration = 750; // Fast 0.75s boot for optimal Lighthouse FCP/LCP
    const intervalTime = 30;
    const increment = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);
        const stepIdx = Math.min(
          Math.floor((next / 100) * BOOT_STEPS.length),
          BOOT_STEPS.length - 1
        );
        setCurrentStepIndex(stepIdx);

        if (next >= 100) {
          clearInterval(timer);
          sessionStorage.setItem('kshetra_booted', 'true');
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(onComplete, 200);
          }, 150);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <main
      role="main"
      aria-label="KSHETRA OS System Initialization"
      className={`fixed inset-0 z-50 bg-[#071F36] text-white flex flex-col items-center justify-between p-6 sm:p-12 transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Banner Bar Landmark */}
      <header role="banner" className="w-full max-w-4xl flex items-center justify-between text-xs text-slate-300 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-100 font-semibold tracking-wider">
            GOI-DPI // BOOT SEQUENCE
          </span>
        </div>
        <div className="text-slate-300">SIH26014 • KSHETRA OS v2.4.0</div>
      </header>

      {/* Center Cinematic Emblem & Radar Graphics */}
      <div className="flex flex-col items-center justify-center space-y-6 my-auto max-w-md text-center">
        {/* Animated Cadastral Concentric Rings with Indian Lion Capital & Ashoka Chakra */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Outer Pulsing Geodesic Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/40 animate-spin" style={{ animationDuration: '14s' }} />
          {/* Middle Rotating Ring */}
          <div className="absolute inset-2 rounded-full border border-blue-400/50 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
          {/* Radar Glow Effect */}
          <div className="absolute inset-4 rounded-full bg-blue-500/10 border border-blue-300/30 flex items-center justify-center shadow-inner" />
          
          {/* Central KSHETRA Cadastral Grid Symbol */}
          <div className="relative z-10 drop-shadow-2xl">
            <KshetraMark size={64} className="w-16 h-16" />
          </div>
        </div>

        {/* Brand Titles with Cinzel Font */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-rajdhani uppercase tracking-[0.25em] text-amber-400 font-bold">
            SMART INDIA HACKATHON 2026 • PS SIH26014
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white font-cinzel">
            KSHETRA OS
          </h1>
          <p className="text-xs text-blue-200/90 font-rajdhani font-semibold tracking-wide text-sm">
            National Digital Public Infrastructure for Land Governance
          </p>
          <div className="inline-block text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-1 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-700">
            Department of Land Resources • MoRD • SIH26014
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="bg-linear-to-r from-orange-500 via-blue-400 to-emerald-400 h-full rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Progress: {Math.round(progress)}%</span>
            <span>Status: ONLINE</span>
          </div>
        </div>

        {/* Terminal Boot Telemetry Text */}
        <div className="w-full bg-[#031322] border border-blue-900/40 rounded-xl p-3 text-left font-mono text-[11px] space-y-1 shadow-md min-h-[58px] flex items-center">
          <div className="flex items-start gap-2 text-blue-300/90 w-full truncate">
            <span className="text-emerald-400 font-bold shrink-0">➜</span>
            <span className="truncate">{BOOT_STEPS[currentStepIndex]}</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls / Skip */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SHA-256 Ledger
          </span>
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-400" /> EPSG:4326 WGS-84
          </span>
        </div>
        <button
          onClick={onComplete}
          className="text-xs text-blue-300 hover:text-white underline font-semibold transition-colors"
        >
          Skip Boot Sequence ➔
        </button>
      </div>
    </main>
  );
};
