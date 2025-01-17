import React, { useCallback } from 'react';
import { Box } from '@mantine/core';
import { ArenaStep } from '../../types/arena';
import type { Student, Flashcard } from '../../types';
import { useArenaBattleSounds } from '../../hooks/useArenaBattleSounds';
import { VersusScreenWrapper } from './screens/VersusScreenWrapper';
import { BattleScreen } from './screens/BattleScreen';
import { FinalResultScreen } from './screens/FinalResultScreen';

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
  // Handle sound effects based on arena step
  useArenaBattleSounds(step);

  const canPickWinner = step !== ArenaStep.VERSUS && !isLoading;

  const handleVersusAnimationDone = useCallback(() => {
    onVersusReady();
  }, [onVersusReady]);

  return (
    <Box data-testid="arena-battle" style={{ width: '100%', position: 'relative' }}>
      {step === ArenaStep.VERSUS && (
        <VersusScreenWrapper
          currentMatch={currentMatch}
          students={students}
          onAnimationComplete={handleVersusAnimationDone}
          onReset={onReset}
        />
      )}
      
      {step === ArenaStep.BATTLE && (
        <BattleScreen
          currentMatch={currentMatch}
          currentFlashcard={currentFlashcard}
          students={students}
          arenaSession={arenaSession}
          onSelectWinner={onSelectWinner}
          onReset={onReset}
          isLoading={isLoading}
          canPickWinner={canPickWinner}
        />
      )}
      
      {step === ArenaStep.FINAL_RESULT && (
        <FinalResultScreen
          arenaSession={arenaSession}
          onReset={onReset}
        />
      )}
    </Box>
  );
};
