import React from 'react';
import { FolderX } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'default' | 'card' | 'dashed';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'dashed',
  className,
}) => {
  const variantStyles = {
    default: 'bg-transparent border-0 p-6',
    card: 'bg-white rounded-2xl border border-slate-200 shadow-xs p-8',
    dashed: 'rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8',
  };

  return (
    <div
      className={cn(
        'w-full flex flex-col items-center justify-center text-center transition-all',
        variantStyles[variant],
        className
      )}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-400 mb-3.5">
        {icon || <FolderX className="w-7 h-7 text-slate-400" />}
      </div>

      {/* Text Info */}
      <h3 className="text-sm sm:text-base font-bold text-slate-800">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {(onAction || onSecondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAction}
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
};
