import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl glass-panel p-6 shadow-xl relative overflow-hidden transition-all duration-200',
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-5 border-b border-surface-border/50 pb-4">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
