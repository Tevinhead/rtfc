import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Global, css } from '@emotion/react';
import {
  Card,
  Text,
  Stack,
  Title,
  Grid,
  Group,
  Avatar,
  Badge,
  Button,
  Box,
  useMantineTheme,
  rem,
} from '@mantine/core';
import { IconArrowUp, IconArrowDown, IconConfetti, IconCrown } from '@tabler/icons-react';
import { Student, ArenaMatch } from '../../../types';
import { achievementsConfig } from '../../../achievements/achievementsConfig';
import { getStudentAchievements } from '../../../achievements/getStudentAchievements';
import { FullScreenWrapper } from './FullScreenWrapper';

interface RoundResultScreenProps {
  currentMatch: ArenaMatch;
  students: Student[];
  onNextRound: () => void;
  onReset: () => void;
}

export const RoundResultScreen: React.FC<RoundResultScreenProps> = ({
  currentMatch,
  students,
  onNextRound,
  onReset,
}) => {
  const theme = useMantineTheme();

  // Identify each player from the students array
  const player1 = students.find((s) => s.id === currentMatch.player1_id);
  const player2 = students.find((s) => s.id === currentMatch.player2_id);

  // Safeguard
  if (!player1 || !player2) {
    return (
      <FullScreenWrapper>
        <Card
          p="xl"
          radius="lg"
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(12px)',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          <Stack align="center" gap="md">
            <Text c="red">Players not found. Something went wrong.</Text>
            <Button onClick={onReset}>Return</Button>
          </Stack>
        </Card>
      </FullScreenWrapper>
    );
  }

  // ELO changes
  const p1Change =
    (currentMatch.player1_elo_after || 0) - currentMatch.player1_elo_before;
  const p2Change =
    (currentMatch.player2_elo_after || 0) - currentMatch.player2_elo_before;

  // Who is the winner? Possibly multiple winners
  const isP1Winner = currentMatch.winner_ids?.includes(player1.id) || false;
  const isP2Winner = currentMatch.winner_ids?.includes(player2.id) || false;

  // Achievements for each player
  const p1Unlocked = getStudentAchievements(player1, []);
  const p2Unlocked = getStudentAchievements(player2, []);

  const p1Achievements = achievementsConfig.filter((ach) =>
    p1Unlocked.includes(ach.id)
  );
  const p2Achievements = achievementsConfig.filter((ach) =>
    p2Unlocked.includes(ach.id)
  );

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: { opacity: 0, scale: 0.9 },
  };

  // Shared styling for winner card background
  const winnerStyle = {
    background: 'linear-gradient(60deg, var(--mantine-color-yellow-4), var(--mantine-color-orange-4))',
    color: 'var(--mantine-color-dark-9)',
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
  };

  const loserStyle = {
    background: 'linear-gradient(60deg, var(--mantine-color-gray-2), var(--mantine-color-gray-3))',
    color: 'var(--mantine-color-dark-7)',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
  };

  const getCardStyle = (isWinner: boolean) => (isWinner ? winnerStyle : loserStyle);

  // ELO Change UI
  const ELOChangeDisplay: React.FC<{ change: number }> = ({ change }) => {
    const isPositive = change >= 0;
    return (
      <Group gap="xs">
        {isPositive ? (
          <IconArrowUp size={18} color={theme.colors.green[5]} />
        ) : (
          <IconArrowDown size={18} color={theme.colors.red[5]} />
        )}
        <Text
          fw={800}
          size="xl"
          c={isPositive ? 'green.3' : 'red.3'}
          style={{
            textShadow: isPositive ? '0 0 4px rgba(0,255,0,0.5)' : '0 0 4px rgba(255,0,0,0.5)',
            background: 'rgba(0,0,0,0.25)',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: 'clamp(1.2rem, 3vh, 1.8rem)'
          }}
        >
          {isPositive ? `+${change}` : change}
        </Text>
      </Group>
    );
  };

  return (
    <FullScreenWrapper>
      <Global
        styles={css`
          @keyframes glow {
            from {
              box-shadow: 0 0 20px rgba(255,215,0,0.4);
            }
            to {
              box-shadow: 0 0 40px rgba(255,215,0,0.7);
            }
          }
        `}
      />
      <AnimatePresence mode="sync">
        <motion.div
          key="round-result-screen"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Card
            p={{ base: 'md', sm: 'lg', md: 'xl' }}
            radius="md"
            shadow="xl"
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(45deg, var(--mantine-color-violet-9), var(--mantine-color-indigo-9))',
              color: '#fff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Rotating Confetti Icon in BG */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                opacity: 0.2,
              }}
            >
              <IconConfetti size={200} />
            </motion.div>

            <Stack gap="md" align="center" justify="center" style={{ height: '100%' }}>
              {/* Title */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              >
                <Title
                  order={2}
                  ta="center"
                  style={{
                    fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
                    textTransform: 'uppercase',
                    textShadow: '0 2px 15px rgba(0,0,0,0.5)',
                  }}
                >
                  Round Complete!
                </Title>
              </motion.div>

              {/* Round Info */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
              >
                <Text size="md" c="cyan.2" fw={500}>
                  Rounds Completed: {currentMatch.rounds_completed}/{currentMatch.num_rounds}
                </Text>
              </motion.div>

              {/* Participants Grid */}
              <Grid
                gutter={{ base: 'md', sm: 'lg', md: 'xl' }}
                style={{
                  width: '100%',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'stretch'
                }}
                align="stretch"
                justify="center"
              >
                {[{ player: player1, isWinner: isP1Winner, eloChange: p1Change, achievements: p1Achievements },
                  { player: player2, isWinner: isP2Winner, eloChange: p2Change, achievements: p2Achievements }]
                  .map(({ player, isWinner, eloChange, achievements }, index) => (
                    <Grid.Col
                      key={player.id}
                      span={6}
                      style={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 100,
                          damping: 15,
                          delay: 0.2 + index * 0.1
                        }}
                        style={{ 
                          width: '100%', 
                          maxWidth: 400,
                          animation: isWinner ? 'glow 1.5s ease-in-out infinite alternate' : undefined
                        }}
                      >
                        <Card
                          p={{ base: 'md', sm: 'lg', md: 'xl' }}
                          radius="lg"
                          withBorder
                          style={{
                            ...getCardStyle(isWinner),
                            position: 'relative',
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Stack gap="md" align="center" style={{ flex: 1, justifyContent: 'space-around' }}>
                            {/* Crown for winner */}
                            {isWinner && (
                              <Box mb={-20} style={{ position: 'relative', zIndex: 2 }}>
                                <IconCrown
                                  size={48}
                                  style={{
                                    color: theme.colors.yellow[4],
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                  }}
                                />
                              </Box>
                            )}
                            {/* AVATAR + NAME */}
                            <Avatar
                              src={player.avatar_url || undefined}
                              alt={player.name}
                              size="clamp(80px, 20vh, 160px)"
                              radius="50%"
                              style={{
                                border: `2px solid ${
                                  isWinner ? theme.colors.yellow[4] : '#fff'
                                }`,
                                boxShadow: isWinner
                                  ? '0 0 10px rgba(255,215,0,0.5)'
                                  : '0 0 8px rgba(255,255,255,0.2)',
                              }}
                            >
                              {(!player.avatar_url && player.name)
                                ? player.name.charAt(0)
                                : ''}
                            </Avatar>

                            <Title
                              order={3}
                              style={{
                                textAlign: 'center',
                                fontSize: 'clamp(1.5rem, 4vh, 2.2rem)',
                                lineHeight: 1.2,
                                marginTop: '2vh',
                                marginBottom: '1vh',
                                fontWeight: 700,
                                color: isWinner ? 'var(--mantine-color-dark-9)' : 'var(--mantine-color-dark-7)',
                                textShadow: isWinner ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {player.name}
                            </Title>

                            {/* Winner / Loser badge */}
                            {isWinner ? (
                              <Badge
                                size="lg"
                                variant="filled"
                                color="green"
                                style={{
                                  padding: 'clamp(0.8rem, 2vh, 1.2rem) clamp(1.2rem, 3vh, 2rem)',
                                  fontSize: 'clamp(1.4rem, 3.5vh, 2rem)',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px',
                                  boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
                                  color: 'var(--mantine-color-green-0)'
                                }}
                              >
                                Winner!
                              </Badge>
                            ) : (
                              <Badge
                                size="lg"
                                variant="filled"
                                color="red"
                                style={{
                                  padding: 'clamp(0.8rem, 2vh, 1.2rem) clamp(1.2rem, 3vh, 2rem)',
                                  fontSize: 'clamp(1.4rem, 3.5vh, 2rem)',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px',
                                  color: 'var(--mantine-color-red-0)',
                                  boxShadow: '0 0 20px rgba(255, 0, 0, 0.2)'
                                }}
                              >
                                Defeated
                              </Badge>
                            )}

                            {/* ELO Ratings */}
                            <Group gap="md" mt="2vh">
                              <Group
                                style={{
                                  background: 'rgba(0,0,0,0.15)',
                                  padding: '0.8rem 1.2rem',
                                  borderRadius: '12px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  backdropFilter: 'blur(4px)'
                                }}
                              >
                                <Text fw={700} style={{
                                  fontSize: 'clamp(1.1rem, 2.5vh, 1.5rem)',
                                  color: isWinner ? 'var(--mantine-color-dark-9)' : 'var(--mantine-color-dark-7)'
                                }}>
                                  ELO: {player.elo_rating}
                                </Text>
                              </Group>
                              <Box style={{ transform: 'scale(clamp(1.2, 2vh, 1.6))' }}>
                                <ELOChangeDisplay change={eloChange} />
                              </Box>
                            </Group>

                            {/* Achievements */}
                            {achievements.length > 0 && (
                              <Stack gap="md" align="center" mt="2vh">
                                <Text fw={600} style={{ fontSize: 'clamp(1rem, 2.5vh, 1.4rem)' }}>
                                  Achievements:
                                </Text>
                                <Group gap="xs">
                                  {achievements.map((ach) => (
                                    <Badge
                                      key={ach.id}
                                      size="md"
                                      color={ach.color}
                                      variant="filled"
                                    >
                                      {ach.title}
                                    </Badge>
                                  ))}
                                </Group>
                              </Stack>
                            )}
                          </Stack>
                        </Card>
                      </motion.div>
                    </Grid.Col>
                  ))}
              </Grid>

              {/* Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <Group mt="xl" justify="center">
                  <Button
                    variant="gradient"
                    gradient={{ from: 'cyan.5', to: 'blue.5' }}
                    size="lg"
                    onClick={onNextRound}
                  >
                    Next Round
                  </Button>
                  <Button variant="light" color="gray" size="lg" onClick={onReset}>
                    Exit Arena
                  </Button>
                </Group>
              </motion.div>
            </Stack>
          </Card>
        </motion.div>
      </AnimatePresence>
    </FullScreenWrapper>
  );
};