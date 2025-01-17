import React from 'react';
import { Stack } from '@mantine/core';
import { ErrorAlert } from '../../shared/ErrorAlert';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { ArenaBattleCard } from '../ArenaBattleCard';
import { Student, Flashcard } from '../../../types';
import { findMatchPlayers } from '../../../utils/playerUtils';

interface BattleScreenProps {
  currentMatch: {
    player1_id: string;
    player2_id: string;
    player1_elo_before: number;
    player2_elo_before: number;
  } | null;
  currentFlashcard: Flashcard | null;
  students: Student[];
  arenaSession: {
    rounds_completed: number;
    num_rounds: number;
  } | null;
  onSelectWinner: (winnerIds: string[]) => void;
  onReset: () => void;
  isLoading: boolean;
  canPickWinner: boolean;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  currentMatch,
  currentFlashcard,
  students,
  arenaSession,
  onSelectWinner,
  onReset,
  isLoading,
  canPickWinner,
}) => {
  if (!currentMatch || !currentFlashcard) {
    return <ErrorAlert error="Battle data not found" onRetry={onReset} />;
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
    <ErrorBoundary fallback={<ErrorAlert error="Failed to display battle" onRetry={onReset} />}>
      <Stack align="center" gap="xl" style={{ width: '100%', minHeight: '70vh' }}>
        <ArenaBattleCard
          flashcard={currentFlashcard}
          player1={player1}
          player2={player2}
          roundsCompleted={arenaSession?.rounds_completed || 0}
          totalRounds={arenaSession?.num_rounds || 0}
          onSelectWinner={onSelectWinner}
          player1ELO={currentMatch.player1_elo_before}
          player2ELO={currentMatch.player2_elo_before}
          isLoading={isLoading}
          canPickWinner={canPickWinner}
        />
      </Stack>
    </ErrorBoundary>
  );
};