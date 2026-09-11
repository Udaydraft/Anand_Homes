import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { ErrorPageLayout } from './ErrorPageLayout';
import { ErrorState } from '../common/ErrorState';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPageLayout statusCode="404">
      <ErrorState
        statusCode="404"
        icon={<FileQuestion className="w-8 h-8 text-amber-600" />}
        title="Page Not Found"
        description="The page or construction resource you are looking for does not exist, has been removed, or is temporarily unavailable."
        actionLabel="Go to Dashboard"
        onAction={() => navigate('/dashboard')}
        secondaryActionLabel="Go Back"
        onSecondaryAction={() => navigate(-1)}
        className="border-amber-200/80 bg-amber-50/40"
      />
    </ErrorPageLayout>
  );
};
