import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { ErrorState } from './ErrorState';
import { PageLoader } from './LoadingState';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageContainerProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  error?: Error | string | null;
  onRetry?: () => void;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  className,
  isLoading = false,
  loadingComponent,
  error = null,
  onRetry,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-[#0D5C3A] font-medium transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'font-bold text-slate-800' : 'text-slate-500'}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Page Header */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            {title && (
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* State Handlers: Error, Loading, Content */}
      {error ? (
        <ErrorState
          title="Failed to Load Content"
          description={typeof error === 'string' ? error : error.message}
          onAction={onRetry}
          actionLabel="Retry"
        />
      ) : isLoading ? (
        loadingComponent || <PageLoader />
      ) : (
        children
      )}
    </div>
  );
};
