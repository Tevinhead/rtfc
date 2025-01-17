import React from 'react';
import { ErrorAlert } from '../../shared/ErrorAlert';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { VersusScreen } from '../VersusScreen';
import { Student } from '../../../types';
import { findMatchPlayers, createParticipantData } from '../../../utils/playerUtils';

interface VersusScreenWrapperProps {
  currentMatch: {
    player1_id: string;
    player2_id: string;
    player1_elo_before: number;
    player2_elo_before: number;
  } | null;
  students: Student[];
  onAnimationComplete: () => void;
  onReset: () => void;
}

export const VersusScreenWrapper: React.FC<VersusScreenWrapperProps> = ({
  currentMatch,
  students,
  onAnimationComplete,
  onReset,
}) => {
  if (!currentMatch) {
    return <ErrorAlert error="Match data not found" onRetry={onReset} />;
  }

  const playersResult = findMatchPlayers(
    students,
    currentMatch.player1_id,
    currentMatch.player2_id
  );

  if (playersResult instanceof Error) {
    return <ErrorAlert error={playersResult.message} onRetry={onReset} />;
  }

  const { player1, player2 } = playersResult;

  return (
    <ErrorBoundary fallback={<ErrorAlert error="Failed to display versus screen" onRetry={onReset} />}>
      <VersusScreen
        participants={[
          createParticipantData(player1, currentMatch.player1_elo_before),
          createParticipantData(player2, currentMatch.player2_elo_before),
        ]}
        onAnimationComplete={onAnimationComplete}
      />
    </ErrorBoundary>
  );
};