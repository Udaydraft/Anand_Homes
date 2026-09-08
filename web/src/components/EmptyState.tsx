import React from 'react';
import { FolderX } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils/cn';

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
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-slate-700 bg-surface/40 p-8 flex flex-col items-center justify-center text-center',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-elevated flex items-center justify-center text-slate-400 mb-4 border border-surface-border">
        {icon || <FolderX className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-semibold text-slate-200">{title}</h4>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
