import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Temporarily Unavailable',
  message = 'An error occurred while loading authoritative records. Please try again.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`p-8 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-xs">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-serif text-lg font-bold text-rose-950">{title}</h3>
        <p className="text-xs text-rose-800 mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="border-rose-300 text-rose-900 hover:bg-rose-100"
        >
          Retry Request
        </Button>
      )}
    </div>
  );
};
