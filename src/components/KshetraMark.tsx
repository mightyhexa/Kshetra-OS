import React from 'react';

interface KshetraMarkProps {
  className?: string;
  size?: number;
}

/**
 * KSHETRA OS Geometric Parcel-Grid Mark
 * Replaces the State Emblem of India as per SIH prototype rules:
 * A clean 4-quadrant geometric cadastral cadastre symbol with sovereign navy border.
 */
export const KshetraMark: React.FC<KshetraMarkProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="KSHETRA Cadastral Grid Symbol"
    >
      {/* Outer Cadastre Boundary */}
      <rect x="2" y="2" width="32" height="32" rx="6" stroke="#0B3D6E" strokeWidth="2.5" fill="#FFFFFF" />
      
      {/* 4 Cadastral Parcel Quadrants */}
      <rect x="6" y="6" width="10" height="10" rx="2" fill="#0B3D6E" fillOpacity="0.85" />
      <rect x="20" y="6" width="10" height="10" rx="2" fill="#0284C7" fillOpacity="0.85" />
      <rect x="6" y="20" width="10" height="10" rx="2" fill="#059669" fillOpacity="0.85" />
      <rect x="20" y="20" width="10" height="10" rx="2" fill="#D97706" fillOpacity="0.85" />

      {/* Center Survey Benchmark Point */}
      <circle cx="18" cy="18" r="2.5" fill="#FFFFFF" stroke="#0B3D6E" strokeWidth="1.5" />
    </svg>
  );
};
