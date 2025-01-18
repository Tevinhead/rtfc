import React from 'react';
import { Stack, Paper } from '@mantine/core';
import { ErrorAlert } from '../../shared/ErrorAlert';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { ArenaBattleCard } from '../ArenaBattleCard';
import { Student, Flashcard } from '../../../types';
import { findMatchPlayers } from '../../../utils/playerUtils';
import { FullScreenWrapper } from './FullScreenWrapper';

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
    return (
      <FullScreenWrapper>
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(12px)',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          <ErrorAlert error="Battle data not found" onRetry={onReset} />
        </Paper>
      </FullScreenWrapper>
    );
  }

  const playersResult = findMatchPlayers(
    students,
    currentMatch.player1_id,
    currentMatch.player2_id
  );

  if (playersResult instanceof Error) {
    return (
      <FullScreenWrapper>
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(12px)',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          <ErrorAlert error={playersResult.message} onRetry={onReset} />
        </Paper>
      </FullScreenWrapper>
    );
  }

  const { player1, player2 } = playersResult;

  return (
    <ErrorBoundary 
      fallback={
        <FullScreenWrapper>
          <Paper
            p="xl"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(12px)',
              maxWidth: '600px',
              width: '100%',
            }}
          >
            <ErrorAlert error="Failed to display battle" onRetry={onReset} />
          </Paper>
        </FullScreenWrapper>
      }
    >
      <FullScreenWrapper>
        <Stack
          align="center"
          justify="center"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            padding: 0,
            overflow: 'hidden'
          }}
        >
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
      </FullScreenWrapper>
    </ErrorBoundary>
  );
};