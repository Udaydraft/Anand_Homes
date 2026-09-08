import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export interface LoadingProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  label = 'Loading...',
  size = 'md',
  fullScreen = false,
  className,
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-4', className)}>
      <Loader2 className={cn('animate-spin text-indigo-500', iconSizes[size])} />
      {label && <p className="text-sm font-medium text-slate-400 animate-pulse">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
