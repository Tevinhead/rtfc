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
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Group justify="center" mb="xl">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Badge
            size="xl"
            variant="gradient"
            gradient={{ from: 'orange', to: 'red' }}
            style={{
              padding: '1.2rem',
              boxShadow: '0 0 15px rgba(255, 107, 107, 0.3)',
            }}
          >
            <IconSword size={28} />
          </Badge>
        </motion.div>
      </Group>

      <Text
        ta="center"
        fw={700}
        mb="md"
        size="xl"
        style={{
          background: 'linear-gradient(45deg, #ff6b6b, #4dabf7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(0,0,0,0.1)',
        }}
      >
        Pick the Winner
      </Text>
      <Group grow>
        <Button
          variant="gradient"
          gradient={{ from: '#4dabf7', to: '#228be6' }}
          data-testid={`select-winner-${player1.id}`}
          onClick={() => onSelectWinner([player1.id])}
          disabled={!canPickWinner || isLoading}
          size="lg"
          leftSection={<IconTrophy size={20} />}
        >
          {player1.name}
        </Button>
        <Button
          variant="gradient"
          gradient={{ from: '#ff6b6b', to: '#fa5252' }}
          data-testid={`select-winner-${player2.id}`}
          onClick={() => onSelectWinner([player2.id])}
          disabled={!canPickWinner || isLoading}
          size="lg"
          leftSection={<IconTrophy size={20} />}
        >
          {player2.name}
        </Button>
      </Group>
    </Card>
  );
};
