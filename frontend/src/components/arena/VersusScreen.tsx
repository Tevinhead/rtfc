import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Text, Avatar, Grid, Box, Paper, MantineTheme } from '@mantine/core';
import { MatchParticipant } from '../../types';
import { FullScreenWrapper } from './screens/FullScreenWrapper';

interface VersusScreenProps {
  participants?: MatchParticipant[];
  onAnimationComplete: () => void;
}

export const VersusScreen: React.FC<VersusScreenProps> = ({
  participants,
  onAnimationComplete,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [onAnimationComplete]);

  if (!participants || participants.length === 0) {
    return <Box>No participants available</Box>;
  }

  const vsVariants = {
    initial: { scale: 3, opacity: 0, rotate: -45 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
        scale: { type: "spring", stiffness: 300, damping: 15 }
      },
    },
  };

  const starVariants = {
    animate: {
      opacity: [0, 1, 0],
      scale: [0.8, 1.5, 0.8],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      },
    },
  };

  const renderPlayerCard = (participant: MatchParticipant, isLeft: boolean) => {
    if (!participant.student) return null;
    const xStart = isLeft ? -300 : 300;

    return (
      <motion.div
        initial={{ x: xStart, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 60,
          damping: 12,
          delay: isLeft ? 0.3 : 0.7,
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(12px)',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            ':hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            }
          }}
        >
          <Avatar
            src={participant.student.avatar_url || undefined}
            alt={participant.student.name}
            size={160}
            radius={80}
            style={{
              margin: '0 auto',
              border: '4px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 80px rgba(255,255,255,0.1)',
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
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              letterSpacing: '0.5px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {participant.student.name}
          </Text>

          <Text
            style={{
              fontSize: 'clamp(1.25rem, 3vw, 2rem)',
              fontWeight: 700,
              color: '#FFD700',
              textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.4)',
              letterSpacing: '2px',
            }}
          >
            {participant.elo_before || 1000} ELO
          </Text>
        </Paper>
      </motion.div>
    );
  };

  return (
    <FullScreenWrapper>
      <Paper
        data-testid="versus-screen"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: `
            linear-gradient(135deg, #1a237e 0%, #311b92 40%, #4a148c 100%),
            radial-gradient(circle at 50% 50%, rgba(103, 58, 183, 0.3) 0%, transparent 60%)
          `,
          borderRadius: '16px',
          padding: '2rem',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Background stars */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            variants={starVariants}
            animate="animate"
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: '120px',
              height: '120px',
              background: `
                radial-gradient(circle at center,
                  rgba(255,215,0,0.3) 0%,
                  rgba(255,215,0,0.1) 30%,
                  transparent 70%
                ),
                radial-gradient(circle at center,
                  rgba(255,255,255,0.2) 0%,
                  transparent 60%
                )
              `,
              filter: 'blur(4px)',
              transform: `rotate(${Math.random() * 360}deg)`,
              transformOrigin: 'center',
              pointerEvents: 'none',
              zIndex: 0,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            }}
          />
        ))}

        {/* Main content grid */}
        <Grid
          style={{
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left player */}
          <Grid.Col span={5} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {renderPlayerCard(participants[0], true)}
          </Grid.Col>

          {/* VS text */}
          <Grid.Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              variants={vsVariants}
              initial="initial"
              animate="animate"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                fw={900}
                style={{
                  fontSize: 'clamp(3rem, 8vw, 6rem)',
                  color: '#FFD700',
                  textShadow:
                    '0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.4), 0 0 120px rgba(255,215,0,0.2)',
                  letterSpacing: '8px',
                  lineHeight: 1,
                }}
              >
                VS
              </Text>
            </motion.div>
          </Grid.Col>

          {/* Right player */}
          <Grid.Col span={5} style={{ display: 'flex', justifyContent: 'flex-start' }}>
            {renderPlayerCard(participants[1], false)}
          </Grid.Col>
        </Grid>
      </Paper>
    </FullScreenWrapper>
  );
};
