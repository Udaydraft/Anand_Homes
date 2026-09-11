import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SuccessMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  message,
  onDismiss,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 shadow-xs transition-all animate-in fade-in duration-200',
        className
      )}
    >
      <div className="p-0.5 text-emerald-600 shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div className="flex-1 text-xs leading-relaxed">
        {title && <h4 className="font-bold text-emerald-950 mb-0.5">{title}</h4>}
        <p className="text-emerald-800 font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-emerald-500 hover:text-emerald-800 p-0.5 rounded-md hover:bg-emerald-100 transition-colors"
          title="Dismiss"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
