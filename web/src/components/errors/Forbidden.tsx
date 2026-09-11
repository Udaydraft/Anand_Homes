import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { ErrorPageLayout } from './ErrorPageLayout';
import { ErrorState } from '../common/ErrorState';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPageLayout statusCode="403">
      <ErrorState
        statusCode="403"
        icon={<ShieldAlert className="w-8 h-8 text-rose-600" />}
        title="Access Denied"
        description="You do not have administrative or supervisor permissions to view this project or execute this action."
        actionLabel="Go to Dashboard"
        onAction={() => navigate('/dashboard')}
        secondaryActionLabel="Go Back"
        onSecondaryAction={() => navigate(-1)}
        className="border-rose-200/80 bg-rose-50/40"
      />
    </ErrorPageLayout>
  );
};
