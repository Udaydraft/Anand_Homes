import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onRetry,
  onDismiss,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs transition-all animate-in fade-in duration-200',
        className
      )}
    >
      <div className="p-0.5 text-rose-600 shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 text-xs leading-relaxed">
        {title && <h4 className="font-bold text-rose-950 mb-0.5">{title}</h4>}
        <p className="text-rose-800 font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 font-bold text-rose-700 hover:text-rose-900 mt-2 underline"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Try Again</span>
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-700 p-0.5 rounded-md hover:bg-rose-100 transition-colors"
          title="Dismiss"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
