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
    <Stack align="center" gap="xs" style={{ flex: 1 }}>
      <Box
        style={{
          position: 'relative',
          padding: '4px',
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${colorGradient.from}, ${colorGradient.to})`,
          boxShadow: `0 0 10px rgba(${colorGradient.from === '#4dabf7' ? '77, 171, 247' : '255, 107, 107'}, 0.3)`,
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Avatar
            src={player.avatar_url || undefined}
            alt={player.name}
            radius="xl"
            size={64}
            style={{
              border: '2px solid #fff',
              boxShadow: `0 0 10px rgba(${colorGradient.from === '#4dabf7' ? '77, 171, 247' : '255, 107, 107'}, 0.2)`,
            }}
          >
            {(!player.avatar_url && player.name) ? player.name.charAt(0) : ''}
          </Avatar>
        </motion.div>
      </Box>
      <Text
        size="xl"
        fw={700}
        style={{
          background: `linear-gradient(45deg, ${colorGradient.from}, ${colorGradient.to})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {player.name}
      </Text>
      <Badge
        size="lg"
        variant="gradient"
        gradient={colorGradient}
      >
        <Text size="md" fw={600}>
          {elo} ELO
        </Text>
      </Badge>
      <Text size="sm" color="dimmed">
        W: {player.wins} L: {player.losses}
      </Text>
    </Stack>
  );
};
