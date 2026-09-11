import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '../../utils/cn';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  statusCode?: string | number;
  className?: string;
  fullPage?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = "We encountered an unexpected error. Please try again or return to the previous page.",
  icon,
  actionLabel = 'Try Again',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  statusCode,
  className,
  fullPage = false,
}) => {
  const content = (
    <div
      className={cn(
        'w-full rounded-2xl border border-rose-200/80 bg-rose-50/50 p-8 flex flex-col items-center justify-center text-center',
        fullPage && 'max-w-md mx-auto shadow-sm',
        className
      )}
    >
      {/* Icon or Status Code */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
          {icon || <AlertTriangle className="w-8 h-8" />}
        </div>
        {statusCode && (
          <span className="absolute -top-1.5 -right-2 px-2 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] tracking-wide shadow-xs">
            {statusCode}
          </span>
        )}
      </div>

      {/* Text Info */}
      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {(onAction || onSecondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {onAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAction}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
};
