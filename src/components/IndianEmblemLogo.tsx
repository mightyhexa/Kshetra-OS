import React from 'react';

interface IndianEmblemLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'navy' | 'gold' | 'white';
  showChakraSpin?: boolean;
}

export const IndianEmblemLogo: React.FC<IndianEmblemLogoProps> = ({
  size = 'md',
  variant = 'navy',
  showChakraSpin = false
}) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8', svg: 'w-7 h-7' },
    md: { container: 'w-11 h-11', svg: 'w-9 h-9' },
    lg: { container: 'w-16 h-16', svg: 'w-14 h-14' },
    xl: { container: 'w-24 h-24', svg: 'w-20 h-20' }
  };

  const colorStyles = {
    navy: {
      primary: '#0B3D6E',
      secondary: '#1E3A8A',
      accent: '#D97706',
      chakra: '#0B3D6E',
      bg: 'bg-white border border-slate-200 shadow-sm'
    },
    gold: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FDE68A',
      chakra: '#F59E0B',
      bg: 'bg-gradient-to-br from-amber-900/30 to-slate-900/60 border border-amber-500/40 shadow-lg'
    },
    white: {
      primary: '#FFFFFF',
      secondary: '#E2E8F0',
      accent: '#38BDF8',
      chakra: '#FFFFFF',
      bg: 'bg-white/10 border border-white/20'
    }
  };

  const style = colorStyles[variant];
  const { container, svg } = sizeMap[size];

  return (
    <div className={`relative ${container} rounded-xl flex items-center justify-center ${style.bg} shrink-0 select-none overflow-hidden`}>
      <svg
        viewBox="0 0 100 100"
        className={`${svg} fill-none`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* LION CAPITAL (THREE LIONS / TIGERS OF ASHOKA) */}
        <g stroke={style.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={style.primary} fillOpacity="0.15">
          {/* Central Lion Head */}
          <path d="M 44 26 C 44 20, 56 20, 56 26 C 58 30, 56 38, 50 40 C 44 38, 42 30, 44 26 Z" />
          {/* Central Lion Crown / Mane */}
          <path d="M 41 24 C 41 17, 59 17, 59 24 C 63 26, 61 35, 57 37 C 56 31, 44 31, 43 37 C 39 35, 37 26, 41 24 Z" />
          <circle cx="47" cy="27" r="1.2" fill={style.primary} />
          <circle cx="53" cy="27" r="1.2" fill={style.primary} />
          <path d="M 48 31 L 52 31 L 50 33 Z" fill={style.primary} />
          <path d="M 47 34 Q 50 36 53 34" stroke={style.primary} strokeWidth="1.5" />

          {/* Left Lion Head & Profile */}
          <path d="M 28 32 C 26 26, 38 23, 40 30 C 41 35, 38 41, 33 42 C 28 41, 27 36, 28 32 Z" />
          <path d="M 26 29 C 23 23, 35 19, 39 25 C 41 28, 40 35, 37 38 C 34 32, 28 34, 26 29 Z" />
          <circle cx="33" cy="32" r="1.1" fill={style.primary} />
          <path d="M 30 35 Q 33 37 36 35" stroke={style.primary} strokeWidth="1.2" />

          {/* Right Lion Head & Profile */}
          <path d="M 72 32 C 74 26, 62 23, 60 30 C 59 35, 62 41, 67 42 C 72 41, 73 36, 72 32 Z" />
          <path d="M 74 29 C 77 23, 65 19, 61 25 C 59 28, 60 35, 63 38 C 66 32, 72 34, 74 29 Z" />
          <circle cx="67" cy="32" r="1.1" fill={style.primary} />
          <path d="M 64 35 Q 67 37 70 35" stroke={style.primary} strokeWidth="1.2" />

          {/* Lion Capital Shoulders & Chest */}
          <path d="M 33 42 C 34 50, 42 54, 50 55 C 58 54, 66 50, 67 42 C 60 45, 40 45, 33 42 Z" />
          <path d="M 45 42 L 45 54 M 55 42 L 55 54" stroke={style.primary} strokeWidth="1.5" />
        </g>

        {/* Abacus / Base Platform */}
        <rect x="22" y="55" width="56" height="5" rx="1.5" fill={style.secondary} />
        <rect x="20" y="60" width="60" height="3" rx="1" fill={style.primary} />

        {/* ASHOKA CHAKRA (24-SPOKE WHEEL) */}
        <g
          className={showChakraSpin ? 'origin-[50px_76px] animate-spin' : ''}
          style={{ animationDuration: '14s' }}
        >
          {/* Outer Wheel Rim */}
          <circle cx="50" cy="76" r="13" stroke={style.chakra} strokeWidth="2" fill="none" />
          <circle cx="50" cy="76" r="11" stroke={style.chakra} strokeWidth="0.8" fill="none" strokeDasharray="1,1.5" />
          {/* Center Hub */}
          <circle cx="50" cy="76" r="3" fill={style.chakra} />

          {/* 24 Spokes generated geometrically */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x2 = 50 + 11.5 * Math.sin(rad);
            const y2 = 76 - 11.5 * Math.cos(rad);
            return (
              <line
                key={i}
                x1="50"
                y1="76"
                x2={x2}
                y2={y2}
                stroke={style.chakra}
                strokeWidth={i % 2 === 0 ? '1.2' : '0.8'}
              />
            );
          })}
        </g>

        {/* Base Pedestal Steps */}
        <path d="M 28 92 L 72 92 L 68 95 L 32 95 Z" fill={style.secondary} />
      </svg>
    </div>
  );
};
