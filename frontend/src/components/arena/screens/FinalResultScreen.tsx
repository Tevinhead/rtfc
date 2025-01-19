import React from 'react';
import { Stack } from '@mantine/core';
import { Student } from '../../../types';
import { ErrorAlert } from '../../shared/ErrorAlert';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { ArenaResultScreen } from '../ArenaResultScreen';

interface FinalResultScreenProps {
  arenaSession: {
    participants: any[];
  } | null;
  students: Student[];
  onReset: () => void;
}

export const FinalResultScreen: React.FC<FinalResultScreenProps> = ({
  arenaSession,
  students,
  onReset,
}) => {
  if (!arenaSession) {
    return <ErrorAlert error="Session data not found" onRetry={onReset} />;
  }

  return (
    <ErrorBoundary fallback={<ErrorAlert error="Failed to display results" onRetry={onReset} />}>
      <Stack gap="md">
        <ArenaResultScreen
          results={arenaSession.participants.map(participant => {
            const student = students.find(s => s.id === participant.student_id);
            return {
              ...participant,
              avatar_url: student?.avatar_url
            };
          })}
          onFinish={onReset}
        />
      </Stack>
    </ErrorBoundary>
  );
};