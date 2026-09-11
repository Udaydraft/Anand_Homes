import React from 'react';
import { Hammer, RefreshCw } from 'lucide-react';
import { ErrorPageLayout } from './ErrorPageLayout';
import { ErrorState } from '../common/ErrorState';

export const Maintenance: React.FC = () => {
  return (
    <ErrorPageLayout>
      <ErrorState
        icon={<Hammer className="w-8 h-8 text-[#0D5C3A]" />}
        title="Scheduled System Maintenance"
        description="We are performing essential updates to improve platform speed and security. Construction data synchronization will resume shortly."
        actionLabel="Check Again"
        onAction={() => window.location.reload()}
        className="border-emerald-200/80 bg-emerald-50/40"
      />
    </ErrorPageLayout>
  );
};
