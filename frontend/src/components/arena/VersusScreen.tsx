import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Text, Avatar, Grid, Box, Group, rem } from '@mantine/core';
import { MatchParticipant } from '../../types';

interface VersusScreenProps {
  participants?: MatchParticipant[];
  onAnimationComplete: () => void;
}

export const VersusScreen: React.FC<VersusScreenProps> = ({
  participants,
  onAnimationComplete,
}) => {
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2500); // 2.5 seconds
    return () => {
      clearTimeout(timer);
    };
  }, [onAnimationComplete]);

  if (!participants || participants.length === 0) {
    return <Box>No participants available</Box>;
  }

  const vsVariants = {
    initial: { scale: 0, opacity: 0, y: 20 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const glowVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <Box
      data-testid="versus-screen"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #4a148c 100%)',
        borderRadius: '16px',
        padding: '3rem',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Background Effect */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}
      />

      <Grid
        justify="center"
        align="center"
        style={{
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* VS TEXT */}
        <Box
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <motion.div
            variants={glowVariants}
            animate="animate"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(20px)',
            }}
          />
          <motion.div
            variants={vsVariants}
            initial="initial"
            animate="animate"
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              fw={900}
              style={{
                fontSize: rem(140),
                color: '#FFD700',
                textShadow: '0 0 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,215,0,0.3), 0 0 90px rgba(255,215,0,0.2)',
                letterSpacing: '8px',
                transform: 'translateY(-50%)',
              }}
            >
              VS
            </Text>
          </motion.div>
        </Box>

        {participants.map((participant, index) => {
          if (!participant.student) return null;
          const isLeft = index === 0;
          const xStart = isLeft ? -200 : 200;

          return (
            <Grid.Col key={participant.student_id} span={6}>
              <motion.div
                initial={{ x: xStart, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 60,
                  damping: 12,
                  delay: 0.2 + index * 0.3,
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '0 2rem',
                }}
              >
                <Box
                  style={{
                    padding: '2rem',
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(12px)',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '360px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(0)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Avatar
                    src={participant.student.avatar_url || undefined}
                    alt={participant.student.name}
                    size={140}
                    radius={70}
                    style={{
                      margin: '0 auto',
                      border: '4px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 0 30px rgba(0,0,0,0.4), 0 0 60px rgba(255,255,255,0.1)'
                    }}
                  >
                    {(!participant.student.avatar_url && participant.student.name)
                      ? participant.student.name.charAt(0)
                      : ''}
                  </Avatar>
                  <Text
                    fw={700}
                    style={{
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: 'clamp(32px, 6vw, 48px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {participant.student.name}
                  </Text>

                  <Group justify="center">
                    <Text
                      size="28px"
                      fw={700}
                      style={{
                        color: '#FFD700',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.3)',
                        letterSpacing: '2px'
                      }}
                    >
                      {participant.elo_before || 1000} ELO
                    </Text>
                  </Group>
                </Box>
              </motion.div>
            </Grid.Col>
          );
        })}
      </Grid>
    </Box>
  );
};
