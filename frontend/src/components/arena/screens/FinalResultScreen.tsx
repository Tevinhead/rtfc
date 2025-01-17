import React from 'react';
import { Stack } from '@mantine/core';
import { ErrorAlert } from '../../shared/ErrorAlert';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { ArenaResultScreen } from '../ArenaResultScreen';

interface FinalResultScreenProps {
  arenaSession: {
    participants: any[];
  } | null;
  onReset: () => void;
}

export const FinalResultScreen: React.FC<FinalResultScreenProps> = ({
  arenaSession,
  onReset,
}) => {
  if (!arenaSession) {
    return <ErrorAlert error="Session data not found" onRetry={onReset} />;
  }

  return (
    <ErrorBoundary fallback={<ErrorAlert error="Failed to display results" onRetry={onReset} />}>
      <Stack gap="md">
        <ArenaResultScreen
          results={arenaSession.participants}
          onFinish={onReset}
        />
      </Stack>
    </ErrorBoundary>
  );
};