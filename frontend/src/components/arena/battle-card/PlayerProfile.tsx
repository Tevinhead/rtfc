import React from 'react';
import { Stack, Avatar, Text, Badge, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { Student } from '../../../types';

interface PlayerProfileProps {
  player: Student;
  elo: number;
  colorGradient: { from: string; to: string };
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({
  player,
  elo,
  colorGradient,
}) => {
  return (
    <Stack align="center" gap={4} style={{ flex: 1 }}>
      <Avatar
        src={player.avatar_url || undefined}
        alt={player.name}
        radius="xl"
        size={48}
        style={{
          border: `2px solid ${colorGradient.from}`,
        }}
      >
        {(!player.avatar_url && player.name) ? player.name.charAt(0) : ''}
      </Avatar>
      <Text size="md" fw={600}>
        {player.name}
      </Text>
      <Text size="sm" c="dimmed">
        ELO: {elo} • W/L: {player.wins}/{player.losses}
      </Text>
    </Stack>
  );
};
