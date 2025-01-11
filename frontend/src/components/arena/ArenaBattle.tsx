import React, { useCallback } from 'react';
import { Stack, Box } from '@mantine/core';
import { ErrorAlert } from '../shared/ErrorAlert';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { ArenaBattleCard } from './ArenaBattleCard';
import { VersusScreen } from './VersusScreen';
import { ArenaResultScreen } from './ArenaResultScreen';
import { ArenaStep } from '../../types/arena';
import type { Student, Flashcard } from '../../types';

interface ArenaBattleProps {
  step: ArenaStep;
  currentFlashcard: Flashcard | null;
  currentMatch: {
    player1_id: string;
    player2_id: string;
    player1_elo_before: number;
    player2_elo_before: number;
  } | null;
  arenaSession: {
    rounds_completed: number;
    num_rounds: number;
    participants: any[];
  } | null;
  students: Student[];
  onVersusReady: () => void;
  onSelectWinner: (winnerIds: string[]) => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ArenaBattle: React.FC<ArenaBattleProps> = ({
  step,
  currentFlashcard,
  currentMatch,
  arenaSession,
  students,
  onVersusReady,
  onSelectWinner,
  onReset,
  isLoading,
}) => {
  const canPickWinner = step !== ArenaStep.VERSUS && !isLoading;

  const handleVersusAnimationDone = useCallback(() => {
    onVersusReady();
  }, [onVersusReady]);

  const renderVersusScreen = () => {
    if (step !== ArenaStep.VERSUS) return null;
    if (!currentMatch) {
      return <ErrorAlert error="Match data not found" onRetry={onReset} />;
    }

    const player1 = students.find(s => s.id === currentMatch.player1_id);
    const player2 = students.find(s => s.id === currentMatch.player2_id);

    if (!player1 || !player2) {
      return <ErrorAlert error="Players not found" onRetry={onReset} />;
    }

    return (
      <ErrorBoundary fallback={<ErrorAlert error="Failed to display versus screen" onRetry={onReset} />}>
        <VersusScreen
          participants={[
            {
              student_id: player1.id,
              student: player1,
              elo_before: currentMatch.player1_elo_before,
            },
            {
              student_id: player2.id,
              student: player2,
              elo_before: currentMatch.player2_elo_before,
            },
          ]}
          onAnimationComplete={handleVersusAnimationDone}
        />
      </ErrorBoundary>
    );
  };

  const renderBattleScreen = () => {
    if (step !== ArenaStep.BATTLE) return null;
    if (!currentMatch || !currentFlashcard) {
      return <ErrorAlert error="Battle data not found" onRetry={onReset} />;
    }

    const player1 = students.find(s => s.id === currentMatch.player1_id);
    const player2 = students.find(s => s.id === currentMatch.player2_id);

    if (!player1 || !player2) {
      return <ErrorAlert error="Players not found" onRetry={onReset} />;
    }

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

  const renderFinalResult = () => {
    if (step !== ArenaStep.FINAL_RESULT) return null;
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

  return (
    <Box data-testid="arena-battle" style={{ width: '100%', position: 'relative' }}>
      {renderVersusScreen()}
      {renderBattleScreen()}
      {renderFinalResult()}
    </Box>
  );
};
