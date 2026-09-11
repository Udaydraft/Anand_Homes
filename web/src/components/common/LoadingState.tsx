import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LoadingStateProps {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading data...',
  description,
  size = 'md',
  fullScreen = false,
  className,
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <div className="relative flex items-center justify-center mb-3">
        <Loader2 className={cn('animate-spin text-[#0D5C3A]', iconSizes[size])} />
      </div>
      {label && (
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
          {label}
        </h4>
      )}
      {description && (
        <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-xs">
          {description}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 max-w-xs w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export const PageLoader: React.FC<{ label?: string }> = ({ label = 'Loading page...' }) => (
  <div className="min-h-[50vh] flex items-center justify-center w-full">
    <LoadingState label={label} size="lg" />
  </div>
);

export const ButtonLoader: React.FC<{ size?: 'sm' | 'md'; className?: string }> = ({
  size = 'sm',
  className,
}) => (
  <Loader2
    className={cn(
      'animate-spin text-current',
      size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
      className
    )}
  />
);
