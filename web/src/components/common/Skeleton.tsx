import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  width,
  height,
  animation = 'pulse',
  className,
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'bg-slate-200/80',
        animation === 'pulse' && 'animate-pulse',
        variantStyles[variant],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4', className)}>
    <div className="flex items-center justify-between">
      <Skeleton width="40%" height={16} />
      <Skeleton variant="circular" width={28} height={28} />
    </div>
    <Skeleton height={120} className="w-full" />
    <div className="space-y-2">
      <Skeleton width="80%" height={14} />
      <Skeleton width="50%" height={12} />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 5, className }) => (
  <div className={cn('bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs', className)}>
    {/* Header */}
    <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
      <Skeleton width={140} height={18} />
      <Skeleton width={80} height={32} />
    </div>
    {/* Table rows */}
    <div className="divide-y divide-slate-100 p-2">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center justify-between gap-4 p-3">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              width={cIdx === 0 ? '30%' : `${Math.max(12, 100 / columns - 4)}%`}
              height={14}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3', className)}>
    <div className="flex items-center justify-between">
      <Skeleton width="50%" height={12} />
      <Skeleton variant="rounded" width={28} height={28} />
    </div>
    <Skeleton width="40%" height={24} />
  </div>
);

export const DetailsSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6', className)}>
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2 w-2/3">
        <Skeleton width="60%" height={24} />
        <Skeleton width="40%" height={14} />
      </div>
      <Skeleton width={100} height={36} />
    </div>
    <Skeleton height={200} className="w-full rounded-xl" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-slate-50 space-y-2">
          <Skeleton width="50%" height={10} />
          <Skeleton width="80%" height={18} />
        </div>
      ))}
    </div>
  </div>
);
