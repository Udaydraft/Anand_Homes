import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { ErrorPageLayout } from './ErrorPageLayout';
import { ErrorState } from '../common/ErrorState';

export const NetworkError: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPageLayout>
      <ErrorState
        icon={<WifiOff className="w-8 h-8 text-amber-600" />}
        title="Network Connection Lost"
        description="Unable to connect to the Anand Homes API. Please check your internet connection or network status and try again."
        actionLabel="Check Connection & Retry"
        onAction={() => window.location.reload()}
        secondaryActionLabel="Go to Dashboard"
        onSecondaryAction={() => navigate('/dashboard')}
        className="border-amber-200/80 bg-amber-50/40"
      />
    </ErrorPageLayout>
  );
};
