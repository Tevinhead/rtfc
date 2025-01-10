import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Text, Stack, Button, Group, Badge, Grid } from '@mantine/core';
import { Match, MatchParticipant } from '../../types';

interface ResultScreenProps {
  match: Match;
  onContinue: () => void;
}

interface ParticipantStatsProps {
  participant: MatchParticipant;
  roundWins: number;
  isWinner: boolean;
}

const ParticipantStats: React.FC<ParticipantStatsProps> = ({
  participant,
  roundWins,
  isWinner,
}) => {
  const eloChange = (participant.elo_after || 0) - (participant.elo_before || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
    >
      <motion.div
        whileHover={{ 
          scale: 1.02,
          rotateY: 5,
          transition: { type: "spring", stiffness: 400, damping: 10 }
        }}
      >
        <Card 
          shadow="sm" 
          p="lg" 
          radius="md" 
          withBorder 
          style={{ 
            height: '100%',
            transform: "perspective(1000px)",
            transformStyle: "preserve-3d",
            background: isWinner ? 
              'linear-gradient(45deg, rgba(255,215,0,0.1), rgba(255,255,255,0.1))' : 
              undefined
          }}
        >
          <Stack align="center" gap="md">
            <motion.div
              animate={isWinner ? {
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: "easeInOut"
              }}
            >
              <Text 
                size="xl" 
                fw={700}
                style={{
                  textShadow: isWinner ? '0 0 10px rgba(255,215,0,0.5)' : undefined
                }}
              >
                {participant.student?.name}
              </Text>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
            >
              <Badge 
                size="xl" 
                color={isWinner ? 'green' : 'red'}
                style={{
                  transform: "translateZ(20px)",
                  boxShadow: isWinner ? '0 0 20px rgba(0,255,0,0.3)' : undefined
                }}
              >
                {isWinner ? 'Winner!' : 'Defeated'}
              </Badge>
            </motion.div>
            
            {/* ELO Change */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.4
              }}
            >
              <motion.div
                animate={isWinner ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, 0, -5, 0]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <Text 
                  size="lg" 
                  c={eloChange >= 0 ? 'green' : 'red'}
                  fw={700}
                  style={{
                    textShadow: `0 0 10px ${eloChange >= 0 ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)'}`
                  }}
                >
                  {eloChange > 0 ? '+' : ''}{Math.round(eloChange * 10) / 10} ELO
                </Text>
              </motion.div>
            </motion.div>

            {/* Rating Change */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.6
              }}
            >
              <Group>
                <Text size="md" c="dimmed">
                  {participant.elo_before} →
                </Text>
                <Text 
                  size="md" 
                  fw={700}
                  style={{
                    color: isWinner ? '#FFD700' : undefined,
                    textShadow: isWinner ? '0 0 10px rgba(255,215,0,0.5)' : undefined
                  }}
                >
                  {participant.elo_after}
                </Text>
              </Group>
            </motion.div>

            {/* Round Wins */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.8
              }}
            >
              <Text size="md">
                Rounds Won: {roundWins}
              </Text>
            </motion.div>

            {/* Winner Effects */}
            {isWinner && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 1
                }}
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px rgba(255,215,0,0.5)',
                  zIndex: -1
                }}
              />
            )}
          </Stack>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export const ResultScreen: React.FC<ResultScreenProps> = ({
  match,
  onContinue
}) => {
  // Calculate round wins for each participant
  const roundWins = React.useMemo(() => {
    const wins: Record<string, number> = {};
    match.rounds?.forEach(round => {
      if (round.winner_ids && round.winner_ids.length > 0) {
        round.winner_ids.forEach(winnerId => {
          wins[winnerId] = (wins[winnerId] || 0) + 1;
        });
      }
    });
    return wins;
  }, [match.rounds]);

  // Sort participants by round wins (descending)
  const sortedParticipants = React.useMemo(() => {
    return [...match.participants].sort((a, b) => {
      const aWins = roundWins[a.student_id] || 0;
      const bWins = roundWins[b.student_id] || 0;
      return bWins - aWins;
    });
  }, [match.participants, roundWins]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}
    >
      <Card 
        shadow="lg" 
        p="xl" 
        radius="md" 
        withBorder
        style={{
          transform: "perspective(1000px)",
          transformStyle: "preserve-3d",
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
        }}
      >
        <Stack align="center" gap="xl">
          {/* Title */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 2, 0, -2, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: "easeInOut"
              }}
            >
              <Text
                size="xl"
                fw={900}
                variant="gradient"
                gradient={{ from: 'gold', to: 'yellow', deg: 45 }}
                ta="center"
                style={{ 
                  fontSize: '3rem',
                  textShadow: '0 0 20px rgba(255,215,0,0.5)',
                  letterSpacing: '0.1em'
                }}
              >
                Match Complete!
              </Text>
            </motion.div>
          </motion.div>

          {/* Match Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.2
            }}
          >
            <Group justify="center" gap="md">
              <Text size="lg" fw={500}>
                Rounds: {match.rounds_completed}/{match.num_rounds}
              </Text>
            </Group>
          </motion.div>

          {/* Participants Grid */}
          <Grid gutter="xl" style={{ width: '100%' }}>
            {sortedParticipants.map((participant, index) => (
              <Grid.Col 
                key={participant.student_id} 
                span={12 / Math.min(sortedParticipants.length, 3)}
              >
                <ParticipantStats
                  participant={participant}
                  roundWins={roundWins[participant.student_id] || 0}
                  isWinner={match.winner_ids?.includes(participant.student_id) ?? false}
                />
              </Grid.Col>
            ))}
          </Grid>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 1
            }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                onClick={onContinue}
                style={{
                  transform: "translateZ(20px)",
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                Continue
              </Button>
            </motion.div>
          </motion.div>
        </Stack>
      </Card>
    </motion.div>
  );
};
