import React from 'react';
import { Stack, Group } from '@mantine/core';
import { Student, Flashcard } from '../../types';
import {
  BattleProgress,
  FlashcardDisplay,
  PlayerProfile,
  WinnerSelection,
} from './battle-card';

interface ArenaBattleCardProps {
  flashcard: Flashcard;
  player1: Student;
  player2: Student;
  roundsCompleted: number;
  totalRounds: number;
  onSelectWinner: (winnerIds: string[]) => void;
  player1ELO: number;
  player2ELO: number;
  isLoading?: boolean;
  canPickWinner: boolean;
}

export const ArenaBattleCard: React.FC<ArenaBattleCardProps> = ({
  flashcard,
  player1,
  player2,
  roundsCompleted,
  totalRounds,
  onSelectWinner,
  player1ELO,
  player2ELO,
  isLoading = false,
  canPickWinner,
}) => {
  return (
    <Stack style={{ width: '100%', maxWidth: '95%', margin: '0 auto' }} gap="md">
      <BattleProgress
        roundsCompleted={roundsCompleted}
        totalRounds={totalRounds}
      />

      <FlashcardDisplay flashcard={flashcard} />

      <Group justify="apart" mb="xl">
        <PlayerProfile
          player={player1}
          elo={player1ELO}
          colorGradient={{ from: '#4dabf7', to: '#228be6' }}
        />
        <PlayerProfile
          player={player2}
          elo={player2ELO}
          colorGradient={{ from: '#ff6b6b', to: '#fa5252' }}
        />
      </Group>

      <WinnerSelection
        player1={player1}
        player2={player2}
        onSelectWinner={onSelectWinner}
        isLoading={isLoading}
        canPickWinner={canPickWinner}
      />
    </Stack>
  );
};
