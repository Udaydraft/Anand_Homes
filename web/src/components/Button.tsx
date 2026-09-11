import React from 'react';
import { cn } from '../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'brand' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  icon,
  ...props
}) => {
  const effectiveLeftIcon = leftIcon || icon;

  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-[0.98] select-none';

  const variants = {
    primary:
      'bg-[#0D5C3A] hover:bg-[#0A482E] text-white shadow-sm shadow-[#0D5C3A]/20 focus:ring-[#0D5C3A] border border-[#0D5C3A]',
    brand:
      'bg-[#0D5C3A] hover:bg-[#0A482E] text-white shadow-sm shadow-[#0D5C3A]/20 focus:ring-[#0D5C3A] border border-[#0D5C3A]',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus:ring-slate-400',
    outline:
      'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-[#0D5C3A]',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400',
    gold:
      'bg-[#C99700] hover:bg-[#B28600] text-slate-950 font-bold focus:ring-[#C99700]',
    subtle:
      'bg-emerald-50 hover:bg-emerald-100 text-[#0D5C3A] border border-emerald-200 focus:ring-[#0D5C3A]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        effectiveLeftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
