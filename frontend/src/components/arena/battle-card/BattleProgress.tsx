import React from 'react';
import { Card, Text, Progress } from '@mantine/core';

interface BattleProgressProps {
  roundsCompleted: number;
  totalRounds: number;
}

export const BattleProgress: React.FC<BattleProgressProps> = ({
  roundsCompleted,
  totalRounds,
}) => {
  return (
    <Card shadow="sm" p="xs" radius="sm" withBorder style={{ background: '#4169E1', color: 'white' }}>
      <Text size="md" fw={600} ta="center" mb="xs">
        Battle {roundsCompleted + 1} of {totalRounds}
      </Text>
      <Progress
        value={((roundsCompleted + 1) / totalRounds) * 100}
        size="md"
        radius="xl"
      />
    </Card>
  );
};
