import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '../../utils/cn';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isSubmitting?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-100/80 border-rose-200',
      btnVariant: 'danger' as const,
    },
    warning: {
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-100/80 border-amber-200',
      btnVariant: 'gold' as const,
    },
    primary: {
      icon: <CheckCircle className="w-6 h-6 text-[#0D5C3A]" />,
      bg: 'bg-emerald-100/80 border-emerald-200',
      btnVariant: 'primary' as const,
    },
  };

  const current = iconConfig[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 transform transition-all animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-12 h-12 rounded-xl border flex items-center justify-center shadow-xs', current.bg)}>
            {current.icon}
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 id="confirm-dialog-title" className="text-base sm:text-lg font-bold text-slate-900">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={current.btnVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isSubmitting}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
