import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerCrash, RefreshCw, Home } from 'lucide-react';
import { ErrorPageLayout } from './ErrorPageLayout';
import { ErrorState } from '../common/ErrorState';

export const ServerError: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPageLayout statusCode="500">
      <ErrorState
        statusCode="500"
        icon={<ServerCrash className="w-8 h-8 text-rose-600" />}
        title="Internal Server Error"
        description="Our servers ran into an unexpected problem while processing this construction database request. Please refresh or try again in a few moments."
        actionLabel="Reload Page"
        onAction={() => window.location.reload()}
        secondaryActionLabel="Go to Dashboard"
        onSecondaryAction={() => navigate('/dashboard')}
        className="border-rose-200/80 bg-rose-50/40"
      />
    </ErrorPageLayout>
  );
};
