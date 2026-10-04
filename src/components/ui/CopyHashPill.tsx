import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface CopyHashPillProps {
  hash: string;
  label?: string;
  truncateLength?: number;
  className?: string;
}

export const CopyHashPill: React.FC<CopyHashPillProps> = ({
  hash,
  label,
  truncateLength = 12,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const displayHash = hash && hash.length > truncateLength * 2
    ? `${hash.slice(0, truncateLength)}...${hash.slice(-truncateLength)}`
    : hash;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Click to copy full SHA-256 hash: ${hash}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] rounded-md font-mono text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B3D6E] select-none ${className}`}
    >
      {label && <span className="font-sans font-semibold text-[#64748B] uppercase text-[10px]">{label}:</span>}
      <span className="text-[#0B3D6E] font-medium">{displayHash}</span>
      <span className="shrink-0 text-slate-400">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" aria-label="Copied" />
        ) : (
          <Copy className="w-3.5 h-3.5 hover:text-[#0B3D6E]" aria-label="Copy hash" />
        )}
      </span>
    </button>
  );
};
