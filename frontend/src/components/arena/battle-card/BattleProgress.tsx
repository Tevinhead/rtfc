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
  );
};
