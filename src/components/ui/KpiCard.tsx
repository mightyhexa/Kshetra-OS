import React from 'react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: 'navy' | 'emerald' | 'amber' | 'rose' | 'slate';
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent = 'navy',
  badge,
  className = '',
  onClick
}) => {
  const accentStyles = {
    navy: 'border-l-4 border-l-[#0B3D6E]',
    emerald: 'border-l-4 border-l-emerald-600',
    amber: 'border-l-4 border-l-amber-500',
    rose: 'border-l-4 border-l-rose-500',
    slate: 'border-l-4 border-l-slate-400'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-2xs transition-all duration-150 ${accentStyles[accent]} ${
        onClick ? 'cursor-pointer hover:shadow-xs hover:border-[#CBD5E1]' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="grow min-w-0">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider truncate">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-2xl font-bold text-[#0F172A] tracking-tight">{value}</span>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && <p className="text-xs text-[#64748B] mt-1 truncate">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] text-[#0B3D6E] shrink-0 border border-slate-200/80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
