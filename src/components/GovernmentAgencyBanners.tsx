import React from 'react';
import { ShieldCheck, MapPin, Database, Sparkles } from 'lucide-react';

/**
 * Prototype Standards & Architecture Badges
 * Replaces official campaign logos (G20, Swachh Bharat) with authentic SIH26014 specifications.
 */
export const GovernmentAgencyBanners: React.FC = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 shrink-0 overflow-x-auto py-1 scrollbar-none">
      {/* 1. SIH 2026 Problem Statement Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded border border-blue-200 shadow-2xs">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0B3D6E]" />
        <div className="flex flex-col text-[9px] leading-tight">
          <span className="font-bold text-[#0B3D6E]">SIH 2026</span>
          <span className="text-[8px] text-slate-500 font-mono">PS SIH26014</span>
        </div>
      </div>

      {/* 2. Bhu-Aadhaar 14-Digit Standard */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded border border-emerald-200 shadow-2xs">
        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
        <div className="flex flex-col text-[9px] leading-tight">
          <span className="font-bold text-emerald-800">Bhu-Aadhaar</span>
          <span className="text-[8px] text-slate-500">14-Digit ULPIN</span>
        </div>
      </div>

      {/* 3. SHA-256 Audit Ledger */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded border border-amber-200 shadow-2xs">
        <Database className="w-3.5 h-3.5 text-amber-700" />
        <div className="flex flex-col text-[9px] leading-tight">
          <span className="font-bold text-amber-800">SHA-256 Ledger</span>
          <span className="text-[8px] text-slate-500">Tamper-Evident</span>
        </div>
      </div>

      {/* 4. Prototype Sandbox Notice */}
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded border border-slate-200 shadow-2xs">
        <Sparkles className="w-3 h-3 text-slate-600" />
        <span className="text-[9px] font-medium text-slate-600">
          Simulated Sandbox • 26 Parcels
        </span>
      </div>
    </div>
  );
};
