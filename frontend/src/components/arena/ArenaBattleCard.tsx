import React from 'react';
import {
  Card,
  Text,
  Stack,
  Button,
  Group,
  Progress,
  Badge,
} from '@mantine/core';
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
      {/* Match progress */}
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

      {/* Battle card */}
      <Card shadow="sm" p="md" radius="md" withBorder>
        <Group justify="space-between" mb="xl">
          {/* Player 1 */}
          <Stack align="center" gap="xs" style={{ flex: 1 }}>
            <Text size="xl" fw={700}>{player1.name}</Text>
            <Badge size="lg" variant="filled" color="blue">
              {player1ELO} ELO
            </Badge>
            <Text size="sm" c="dimmed">
              W: {player1.wins} L: {player1.losses}
            </Text>
          </Stack>

          {/* VS Badge */}
          <Badge
            size="xl"
            variant="gradient"
            gradient={{ from: 'orange', to: 'red' }}
            style={{ padding: '1rem' }}
          >
            <IconSword size={24} />
          </Badge>

          {/* Player 2 */}
          <Stack align="center" gap="xs" style={{ flex: 1 }}>
            <Text size="xl" fw={700}>{player2.name}</Text>
            <Badge size="lg" variant="filled" color="blue">
              {player2ELO} ELO
            </Badge>
            <Text size="sm" c="dimmed">
              W: {player2.wins} L: {player2.losses}
            </Text>
          </Stack>
        </Group>

        {/* One-click winner selection */}
        <Text ta="center" fw={500} mb="md">Pick the Winner</Text>
        <Group grow>
          <Button
            variant="filled"
            color="blue"
            data-testid={`select-winner-${player1.id}`}
            onClick={() => handleWinnerClick(player1.id)}
            disabled={!canPickWinner || isLoading}
            size="lg"
            leftSection={<IconTrophy size={20} />}
          >
            {player1.name}
          </Button>
          <Button
            variant="filled"
            color="blue"
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
