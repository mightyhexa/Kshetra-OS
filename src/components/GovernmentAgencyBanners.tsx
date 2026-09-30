import React from 'react';

/**
 * Authentic Government of India Initiative Badges & Emblems
 * As seen on official central ministry portals (mha.gov.in, rural.gov.in, dolr.gov.in)
 */

export const GovernmentAgencyBanners: React.FC = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-4 shrink-0 overflow-x-auto py-1 scrollbar-none">
      {/* 1. SWACHH BHARAT MISSION (Iconic Gandhi Glasses Logo) */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
        <svg viewBox="0 0 100 40" className="w-14 sm:w-16 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
          {/* Eyeglasses Frame */}
          <circle cx="28" cy="20" r="14" fill="none" stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="72" cy="20" r="14" fill="none" stroke="#1E293B" strokeWidth="2.5" />
          <path d="M 42 16 Q 50 12 58 16" fill="none" stroke="#1E293B" strokeWidth="2.5" />
          <path d="M 14 16 L 3 13 M 86 16 L 97 13" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          {/* Text in Lenses */}
          <text x="28" y="24" fontSize="10" fontWeight="bold" fill="#047857" textAnchor="middle">स्वच्छ</text>
          <text x="72" y="24" fontSize="10" fontWeight="bold" fill="#047857" textAnchor="middle">भारत</text>
        </svg>
        <span className="hidden xl:inline text-[9px] font-bold text-slate-700 leading-tight">
          एक कदम स्वच्छता की ओर
        </span>
      </div>

      {/* 2. G20 INDIA (Vasudhaiva Kutumbakam) */}
      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 rounded border border-orange-200/80 shadow-2xs">
        <svg viewBox="0 0 80 40" className="w-12 sm:w-14 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
          {/* Lotus Petals & Globe */}
          <circle cx="48" cy="18" r="8" fill="#1D4ED8" />
          <path d="M 48 10 Q 56 18 48 26 Q 40 18 48 10 Z" fill="#F97316" />
          <text x="22" y="26" fontSize="18" fontWeight="900" fill="#EA580C" fontFamily="sans-serif">G2</text>
          <text x="48" y="26" fontSize="18" fontWeight="900" fill="#16A34A" fontFamily="sans-serif">0</text>
        </svg>
        <div className="hidden lg:flex flex-col text-[8px] font-bold text-slate-700 leading-tight">
          <span className="text-[#EA580C]">भारत 2023 INDIA</span>
          <span className="text-[7px] text-slate-500 font-normal">वसुधैव कुटुम्बकम्</span>
        </div>
      </div>

      {/* 3. DIGITAL INDIA / BHU-AADHAAR (MoRD & DoLR Initiative) */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50/80 rounded border border-blue-200 shadow-2xs">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0B3D6E] to-blue-500 flex items-center justify-center text-white font-black text-[10px] shadow-2xs">
          भू
        </div>
        <div className="flex flex-col text-[8px] leading-tight">
          <span className="font-bold text-[#0B3D6E] uppercase">Bhu-Aadhaar</span>
          <span className="text-[7px] text-slate-500">ULPIN • MoRD / DoLR</span>
        </div>
      </div>

      {/* 4. AZADI KA AMRIT MAHOTSAV (75+ Years) */}
      <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-emerald-50/60 rounded border border-emerald-200 shadow-2xs">
        <div className="flex flex-col text-[8px] font-bold text-slate-700 leading-tight text-center">
          <span className="text-[#EA580C]">आज़ादी का</span>
          <span className="text-emerald-700 font-black">अमृत महोत्सव</span>
        </div>
      </div>
    </div>
  );
};
