import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Info,
  Scale,
  FileCheck
} from 'lucide-react';

export type SeverityLevel = 'clear' | 'amber' | 'rose' | 'info' | 'court' | 'statutory';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity?: SeverityLevel;
  icon?: React.ReactNode;
  label?: string;
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  severity = 'info',
  icon,
  label,
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const styles: Record<SeverityLevel, { bg: string; text: string; border: string; defaultIcon: React.ReactNode }> = {
    clear: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      defaultIcon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-300',
      defaultIcon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      border: 'border-rose-300',
      defaultIcon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
    },
    court: {
      bg: 'bg-rose-100/90',
      text: 'text-rose-950',
      border: 'border-rose-400 border-dashed',
      defaultIcon: <Scale className="w-3.5 h-3.5 text-rose-700 shrink-0" aria-hidden="true" />
    },
    info: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300',
      defaultIcon: <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
    },
    statutory: {
      bg: 'bg-[#F0F5FA]',
      text: 'text-[#0B3D6E]',
      border: 'border-[#CBD5E1]',
      defaultIcon: <FileCheck className="w-3.5 h-3.5 text-[#0B3D6E] shrink-0" aria-hidden="true" />
    }
  };

  const current = styles[severity];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  const isRisk = severity === 'amber' || severity === 'rose' || severity === 'court';
  const pulseClass = isRisk ? 'badge-pulse-once' : '';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${pulseClass} select-none ${className}`}
      {...props}
    >
      {icon || current.defaultIcon}
      <span>{label || children}</span>
    </span>
  );
};
