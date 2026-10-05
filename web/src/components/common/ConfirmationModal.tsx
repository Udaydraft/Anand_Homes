import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Loader2,
  Trash2,
} from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

export interface DetailItem {
  label: string;
  value: string | number;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  details?: DetailItem[];
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  details = [],
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-rose-600" />,
      iconBg: 'bg-rose-50 border border-rose-100',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
      accentBorder: 'border-t-4 border-t-rose-500',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-50 border border-amber-100',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
      accentBorder: 'border-t-4 border-t-amber-500',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    success: {
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border border-emerald-100',
      confirmBtn: 'bg-[#0D5C3A] hover:bg-[#094228] text-white',
      accentBorder: 'border-t-4 border-t-emerald-600',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      iconBg: 'bg-blue-50 border border-blue-100',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
      accentBorder: 'border-t-4 border-t-blue-500',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden ${variantStyles.accentBorder} animate-in zoom-in-95 duration-150`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          {/* Top header row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${variantStyles.iconBg}`}>
                {variantStyles.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                  Confirmation Required
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description Message */}
          <p className="text-xs text-slate-600 leading-relaxed mb-4">{message}</p>

          {/* Structured Detail Badges (if provided) */}
          {details.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-5 space-y-1.5 text-xs">
              {details.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">{item.label}:</span>
                  <span className="font-bold text-slate-800 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Buttons Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={async () => {
                await onConfirm();
              }}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 ${variantStyles.confirmBtn}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
