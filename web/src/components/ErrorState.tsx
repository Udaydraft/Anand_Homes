import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 flex flex-col items-center text-center justify-center gap-3',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-rose-300">{title}</h4>
      <p className="text-sm text-slate-400 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          className="mt-2 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
