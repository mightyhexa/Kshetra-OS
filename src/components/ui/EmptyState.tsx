import React from 'react';
import { Inbox, RefreshCw, AlertOctagon } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-[#CBD5E1] ${className}`}>
      <div className="p-3 bg-[#F8FAFC] rounded-full text-slate-400 mb-3 border border-slate-200">
        {icon || <Inbox className="w-8 h-8" aria-hidden="true" />}
      </div>
      <h4 className="font-serif text-base font-semibold text-[#0F172A]">{title}</h4>
      {description && <p className="text-xs text-[#64748B] max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  className = ''
}) => {
  const { t } = useLanguage();
  const displayTitle = title || t('serviceErrorDefault');

  return (
    <div className={`p-5 rounded-xl bg-rose-50 border border-rose-200 text-left ${className}`} role="alert">
      <div className="flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="grow min-w-0">
          <h4 className="font-serif text-sm font-semibold text-rose-900">{displayTitle}</h4>
          <p className="text-xs text-rose-700 mt-1 leading-relaxed font-mono">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button variant="danger" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
                {t('retryOperation')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
