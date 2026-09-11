import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, Home } from 'lucide-react';
import { ErrorPageLayout } from './ErrorPageLayout';
import { ErrorState } from '../common/ErrorState';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPageLayout statusCode="401">
      <ErrorState
        statusCode="401"
        icon={<Lock className="w-8 h-8 text-blue-600" />}
        title="Authentication Required"
        description="Your session has expired or you need to log in to access this section of Anand Homes Platform."
        actionLabel="Log In"
        onAction={() => navigate('/login')}
        secondaryActionLabel="Go to Dashboard"
        onSecondaryAction={() => navigate('/dashboard')}
        className="border-blue-200/80 bg-blue-50/40"
      />
    </ErrorPageLayout>
  );
};
