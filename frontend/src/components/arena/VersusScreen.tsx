import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Text, Avatar, Stack, Grid, Box } from '@mantine/core';
import { Student, MatchParticipant } from '../../types';

interface VersusScreenProps {
  participants?: MatchParticipant[];
  onAnimationComplete: () => void;
}

export const VersusScreen: React.FC<VersusScreenProps> = ({ 
  participants, 
  onAnimationComplete 
}) => {
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    // Call onAnimationComplete directly after a delay
    // This ensures the callback is called regardless of state updates
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2000);  // Reduced to 2 seconds since that should be enough for the animations

    return () => {
      clearTimeout(timer);
    };
  }, [onAnimationComplete]);

  if (!participants || participants.length === 0) {
    return <Box>No participants available</Box>;
  }

  return (
    <motion.div
      data-testid="versus-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <Grid style={{ width: '100%', maxWidth: '1200px' }}>
        {participants.map((participant, index) => {
          if (!participant.student) {
            return null;
          }

          return (
            <Grid.Col key={participant.student_id} span={6}>
              <motion.div
                initial={{ 
                  x: index === 0 ? -100 : 100,
                  opacity: 0 
                }}
                animate={{ 
                  x: 0,
                  opacity: 1 
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.5
                }}
              >
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Stack align="center" gap="md">
                    <Avatar 
                      size={120}
                      radius={60}
                      color={index === 0 ? "blue" : "red"}
                    >
                      {participant.student.name.charAt(0)}
                    </Avatar>
                    <Text size="xl" fw={700}>
                      {participant.student.name}
                    </Text>
                    <Text size="lg" c="dimmed">
                      ELO: {participant.elo_before}
                    </Text>
                    <Text size="sm">
                      W: {participant.student.wins} L: {participant.student.losses}
                    </Text>
                  </Stack>
                </Card>
              </motion.div>
            </Grid.Col>
          );
        })}
      </Grid>
    </motion.div>
  );
};
