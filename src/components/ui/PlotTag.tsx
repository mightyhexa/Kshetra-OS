import React, { useState } from 'react';
import { MapPin, Copy, Check } from 'lucide-react';
import { formatUlpin } from '../../../shared/ulpin';

export interface PlotTagProps {
  ulpin: string;
  size?: 'sm' | 'md' | 'lg';
  showCopy?: boolean;
  className?: string;
}

export const PlotTag: React.FC<PlotTagProps> = ({
  ulpin,
  size = 'md',
  showCopy = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const formatted = formatUlpin(ulpin);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(ulpin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  };

  return (
    <span
      className={`inline-flex items-center bg-[#F0F5FA] text-[#0B3D6E] border border-[#CBD5E1] rounded-md font-mono font-semibold select-all ${sizeClasses[size]} ${className}`}
    >
      <MapPin className="w-3.5 h-3.5 text-[#0B3D6E] shrink-0" aria-hidden="true" />
      <span className="tracking-wider">{formatted}</span>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          title="Copy 14-digit ULPIN"
          className="ml-1 text-slate-400 hover:text-[#0B3D6E] cursor-pointer focus:outline-none"
          aria-label="Copy ULPIN"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-600" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}
    </span>
  );
};
