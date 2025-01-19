import React, { useCallback } from 'react';
import { Box } from '@mantine/core';
import { ArenaStep, ArenaMatch } from '../../types/arena';
import type { Student, Flashcard } from '../../types';
import { useArenaBattleSounds } from '../../hooks/useArenaBattleSounds';
import { VersusScreenWrapper } from './screens/VersusScreenWrapper';
import { BattleScreen } from './screens/BattleScreen';
import { FinalResultScreen } from './screens/FinalResultScreen';
import { RoundResultScreen } from './screens/RoundResultScreen';

interface ArenaBattleProps {
  step: ArenaStep;
  currentFlashcard: Flashcard | null;
  currentMatch: ArenaMatch | null;
  arenaSession: {
    rounds_completed: number;
    num_rounds: number;
    participants: any[];
  } | null;
  students: Student[];
  onVersusReady: () => void;
  onSelectWinner: (winnerIds: string[]) => void;
  onNextRound: () => void;
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
  onNextRound,
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
    <Box
      data-testid="arena-battle"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
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
      
      {step === ArenaStep.ROUND_RESULT && currentMatch && (
        <RoundResultScreen
          currentMatch={currentMatch}
          students={students}
          onNextRound={onNextRound}
          onReset={onReset}
        />
      )}

      {step === ArenaStep.FINAL_RESULT && (
        <FinalResultScreen
          arenaSession={arenaSession}
          students={students}
          onReset={onReset}
        />
      )}
    </Box>
  );
};
