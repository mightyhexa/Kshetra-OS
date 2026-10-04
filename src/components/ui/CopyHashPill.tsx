import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export interface CopyHashPillProps {
  hash: string;
  label?: string;
  truncateLength?: number;
  className?: string;
}

export const CopyHashPill: React.FC<CopyHashPillProps> = ({
  hash,
  label,
  truncateLength = 8,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`inline-flex flex-col gap-1 max-w-full ${className}`}>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] rounded-md font-mono text-xs select-none">
        {label && <span className="font-sans font-semibold text-[#64748B] uppercase text-[10px]">{label}:</span>}
        <span className="text-[#0B3D6E] font-medium">{isExpanded ? 'SHA-256' : displayHash}</span>
        
        <button
          type="button"
          onClick={handleCopy}
          title={`Copy hash: ${hash}`}
          aria-label="Copy hash"
          className="p-1 hover:bg-slate-200 rounded min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0B3D6E]"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-[#0B3D6E]" />
          )}
        </button>

        {hash && hash.length > 16 && (
          <button
            type="button"
            onClick={toggleExpand}
            title={isExpanded ? 'Collapse hash' : 'Expand full hash'}
            aria-label={isExpanded ? 'Collapse full hash' : 'Expand full hash'}
            className="p-1 hover:bg-slate-200 rounded min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer text-slate-500 hover:text-[#0B3D6E]"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-2 bg-slate-900 text-slate-100 rounded border border-slate-700 font-mono text-[11px] break-all leading-tight max-w-md shadow-inner">
          <span className="text-amber-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Full Unabridged SHA-256 Hash</span>
          {hash}
        </div>
      )}
    </div>
  );
};
