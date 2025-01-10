import React from 'react';
import {
  Card,
  Text,
  Stack,
  Button,
  Group,
  Progress,
  Badge,
  Avatar,
  Box,
} from '@mantine/core';
import { motion } from 'framer-motion';
import { IconSword, IconTrophy } from '@tabler/icons-react';
import { Student } from '../../types';
import { useSound } from '../../hooks/useSound';

interface ArenaBattleCardProps {
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
  const { playSound } = useSound();

  const handleWinnerClick = (playerId: string) => {
    if (!canPickWinner || isLoading) return;
    playSound('correct');
    onSelectWinner([playerId]);
  };

  return (
    <Stack style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }} gap="md">
      <Card shadow="sm" p="md" radius="md" withBorder>
        <Text size="lg" fw={700} ta="center" mb="md">
          Battle {roundsCompleted + 1} of {totalRounds}
        </Text>
        <Progress
          value={((roundsCompleted + 1) / totalRounds) * 100}
          size="xl"
          radius="xl"
          mb="md"
        />
      </Card>

      <Card shadow="sm" p="md" radius="md" withBorder>
        <Group justify="space-between" mb="xl">
          {/* Player 1 */}
          <Stack align="center" gap="xs" style={{ flex: 1 }}>
            <Box
              style={{
                position: 'relative',
                padding: '4px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #4dabf7, #228be6)',
                boxShadow: '0 0 10px rgba(77, 171, 247, 0.3)'
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Avatar
                  src={player1.avatar_url || undefined}
                  alt={player1.name}
                  radius="xl"
                  size={80}
                  style={{
                    border: '2px solid #fff',
                    boxShadow: '0 0 10px rgba(77, 171, 247, 0.2)'
                  }}
                >
                  {(!player1.avatar_url && player1.name) ? player1.name.charAt(0) : ''}
                </Avatar>
              </motion.div>
            </Box>
            <Text 
              size="xl" 
              fw={700}
              style={{
                background: 'linear-gradient(45deg, #4dabf7, #228be6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {player1.name}
            </Text>
            <Badge 
              size="lg" 
              variant="gradient" 
              gradient={{ from: '#4dabf7', to: '#228be6' }}
            >
              {player1ELO} ELO
            </Badge>
            <Text size="sm" c="dimmed">
              W: {player1.wins} L: {player1.losses}
            </Text>
          </Stack>

          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Badge
              size="xl"
              variant="gradient"
              gradient={{ from: 'orange', to: 'red' }}
              style={{ 
                padding: '1.2rem',
                boxShadow: '0 0 15px rgba(255, 107, 107, 0.3)'
              }}
            >
              <IconSword size={28} />
            </Badge>
          </motion.div>

          {/* Player 2 */}
          <Stack align="center" gap="xs" style={{ flex: 1 }}>
            <Box
              style={{
                position: 'relative',
                padding: '4px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #ff6b6b, #fa5252)',
                boxShadow: '0 0 10px rgba(255, 107, 107, 0.3)'
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Avatar
                  src={player2.avatar_url || undefined}
                  alt={player2.name}
                  radius="xl"
                  size={80}
                  style={{
                    border: '2px solid #fff',
                    boxShadow: '0 0 10px rgba(255, 107, 107, 0.2)'
                  }}
                >
                  {(!player2.avatar_url && player2.name) ? player2.name.charAt(0) : ''}
                </Avatar>
              </motion.div>
            </Box>
            <Text 
              size="xl" 
              fw={700}
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #fa5252)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {player2.name}
            </Text>
            <Badge 
              size="lg" 
              variant="gradient" 
              gradient={{ from: '#ff6b6b', to: '#fa5252' }}
            >
              {player2ELO} ELO
            </Badge>
            <Text size="sm" c="dimmed">
              W: {player2.wins} L: {player2.losses}
            </Text>
          </Stack>
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
            textShadow: '0 0 20px rgba(0,0,0,0.1)'
          }}
        >
          Pick the Winner
        </Text>
        <Group grow>
          <Button
            variant="gradient"
            gradient={{ from: '#4dabf7', to: '#228be6' }}
            data-testid={`select-winner-${player1.id}`}
            onClick={() => handleWinnerClick(player1.id)}
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
            onClick={() => handleWinnerClick(player2.id)}
            disabled={!canPickWinner || isLoading}
            size="lg"
            leftSection={<IconTrophy size={20} />}
          >
            {player2.name}
          </Button>
        </Group>
      </Card>
    </Stack>
  );
};
