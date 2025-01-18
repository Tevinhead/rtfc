import React from 'react';
import { Card, Text, Group, Button } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconSword, IconTrophy } from '@tabler/icons-react';
import { Badge } from '@mantine/core';
import { Student } from '../../../types';

interface WinnerSelectionProps {
  player1: Student;
  player2: Student;
  onSelectWinner: (winnerIds: string[]) => void;
  isLoading?: boolean;
  canPickWinner: boolean;
}

export const WinnerSelection: React.FC<WinnerSelectionProps> = ({
  player1,
  player2,
  onSelectWinner,
  isLoading = false,
  canPickWinner,
}) => {
  return (
    <Card shadow="sm" p="xs" radius="sm" withBorder>
      <Group grow gap="xs">
        <Button
          variant="filled"
          color="pink"
          data-testid={`select-winner-${player1.id}`}
          onClick={() => onSelectWinner([player1.id])}
          disabled={!canPickWinner || isLoading}
          size="sm"
        >
          Winner
        </Button>
        <Button
          variant="filled"
          color="pink"
          data-testid={`select-winner-${player2.id}`}
          onClick={() => onSelectWinner([player2.id])}
          disabled={!canPickWinner || isLoading}
          size="sm"
        >
          Winner
        </Button>
      </Group>
    </Card>
  );
};
