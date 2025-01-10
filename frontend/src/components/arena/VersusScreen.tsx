import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Text, Avatar, Stack, Grid, Box, Center } from '@mantine/core';
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
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2000);
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
        type: 'spring',
        stiffness: 100,
        damping: 15
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)'
      }}
    >
      <Grid style={{ width: '100%', maxWidth: '1200px', position: 'relative' }}>
        {/* VS Text */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <Text
            size="64px"
            fw={900}
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4dabf7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(0,0,0,0.2)'
            }}
          >
            VS
          </Text>
        </motion.div>

        {participants.map((participant, index) => {
          if (!participant.student) {
            return null;
          }

          const isPlayer1 = index === 0;
          const playerColor = isPlayer1 ? '#4dabf7' : '#ff6b6b';
          const playerColorDark = isPlayer1 ? '#228be6' : '#fa5252';

          return (
            <Grid.Col key={participant.student_id} span={6}>
              <motion.div
                initial={{
                  x: isPlayer1 ? -100 : 100,
                  opacity: 0
                }}
                animate={{
                  x: 0,
                  opacity: 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                  delay: 0.5
                }}
              >
                <Card 
                  shadow="xl" 
                  p="xl" 
                  radius="md" 
                  withBorder 
                  style={{
                    background: 'linear-gradient(45deg, rgba(0,0,0,0.02) 0%, rgba(255,255,255,0.1) 100%)',
                    borderColor: playerColor,
                    borderWidth: '2px'
                  }}
                >
                  <Stack align="center" gap="md">
                    <Box
                      style={{
                        position: 'relative',
                        padding: '8px',
                        borderRadius: '50%',
                        background: `linear-gradient(45deg, ${playerColor}, ${playerColorDark})`,
                        boxShadow: `0 0 20px ${playerColor}50`
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          rotate: [0, 3, -3, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      >
                        <Avatar
                          src={participant.student.avatar_url || undefined}
                          alt={participant.student.name}
                          size={150}
                          radius={75}
                          color={isPlayer1 ? 'blue' : 'red'}
                          style={{
                            border: `4px solid ${playerColorDark}`,
                            boxShadow: `0 0 10px ${playerColor}`
                          }}
                        >
                          {(!participant.student.avatar_url && participant.student.name)
                            ? participant.student.name.charAt(0)
                            : ''}
                        </Avatar>
                      </motion.div>
                    </Box>
                    <Text 
                      size="xl" 
                      fw={700}
                      style={{
                        background: `linear-gradient(45deg, ${playerColor}, ${playerColorDark})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {participant.student.name}
                    </Text>
                    <Stack gap="xs">
                      <Text 
                        size="lg" 
                        fw={600}
                        style={{
                          color: playerColorDark
                        }}
                      >
                        ELO: {participant.elo_before}
                      </Text>
                      <Text 
                        size="sm"
                        style={{
                          background: `linear-gradient(45deg, ${playerColor}, ${playerColorDark})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        W: {participant.student.wins} L: {participant.student.losses}
                      </Text>
                    </Stack>
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
