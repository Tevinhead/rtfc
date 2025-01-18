import React from 'react';
import { motion } from 'framer-motion';
import { Card, Text, Stack, Button, Group, Badge, Grid, Table, Avatar } from '@mantine/core';
import { IconTrophy, IconArrowUp, IconArrowDown, IconConfetti } from '@tabler/icons-react';

interface StudentStats {
  student_id: string;
  name: string;
  elo_rating: number;
  wins: number;
  losses: number;
  fights_played: number;
  elo_change: number;
  avatar_url?: string;
}

interface ArenaResultScreenProps {
  results: StudentStats[];
  onFinish: () => void;
}

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const color = rank === 1 ? 'yellow' : rank === 2 ? 'gray' : rank === 3 ? 'orange' : 'blue';
  const icon = rank <= 3 ? <IconTrophy size={16} /> : null;

  return (
    <Badge
      size="lg"
      color={color}
      variant={rank <= 3 ? 'filled' : 'light'}
      leftSection={icon}
    >
      #{rank}
    </Badge>
  );
};

export const ArenaResultScreen: React.FC<ArenaResultScreenProps> = ({
  results,
  onFinish
}) => {
  // Sort results by ELO rating descending
  const sortedResults = React.useMemo(() => {
    return [...results].sort((a, b) => b.elo_rating - a.elo_rating);
  }, [results]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      style={{
        width: '100%',
        height: '100%',
        margin: '0 auto',
        padding: 'min(2vh, 2rem)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Card
        shadow="lg"
        p="xl"
        radius="md"
        withBorder
        style={{
          background: 'linear-gradient(45deg, #F8FFAE, #43C6AC)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Confetti Icon in BG */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            opacity: 0.2,
          }}
        >
          <IconConfetti size={200} />
        </motion.div>

        <Stack align="center" gap="xl">
          {/* Title */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15,
            }}
          >
            <Text
              size="xl"
              fw={900}
              style={{
                fontSize: '3rem',
                textAlign: 'center',
                color: '#fff',
                textShadow: '0 0 20px rgba(0,0,0,0.4)',
              }}
            >
              Arena Complete!
            </Text>
          </motion.div>

          {/* Top 3 Podium */}
          <Grid gutter="xl" style={{ width: '100%' }}>
            {sortedResults.slice(0, 3).map((student, index) => (
              <Grid.Col key={student.student_id} span={4}>
                <Card
                  shadow="md"
                  p="lg"
                  radius="md"
                  withBorder
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Stack align="center" gap="md">
                    <RankBadge rank={index + 1} />
                    <Avatar
                      src={student.avatar_url}
                      alt={student.name}
                      size={100}
                      radius="xl"
                      style={{
                        border: '3px solid var(--mantine-color-blue-5)',
                        boxShadow: '0 0 15px rgba(0,0,0,0.2)'
                      }}
                    >
                      {!student.avatar_url && student.name ? student.name.charAt(0) : ''}
                    </Avatar>
                    <Text size="xl" fw={700} c="dark" style={{ fontSize: '1.8rem' }}>
                      {student.name}
                    </Text>
                    <Badge size="xl" variant="filled" color="blue" style={{ fontSize: '1.2rem' }}>
                      {student.elo_rating} ELO
                    </Badge>
                    <Group>
                      <Badge size="lg" color="green" style={{ fontSize: '1.1rem' }}>Wins: {student.wins}</Badge>
                      <Badge size="lg" color="red" style={{ fontSize: '1.1rem' }}>Losses: {student.losses}</Badge>
                    </Group>
                    <Text
                      size="xl"
                      c={student.elo_change >= 0 ? 'dark' : 'dark'}
                      fw={700}
                      style={{ fontSize: '1.4rem' }}
                    >
                      {student.elo_change > 0 ? '+' : ''}
                      {Math.round(student.elo_change)} ELO
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* Full Results Table */}
          <Card
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            style={{ width: '100%', background: 'rgba(255,255,255,0.9)' }}
          >
            <Text size="xl" fw={800} mb="md" c="dark" style={{ fontSize: '1.8rem' }}>
              Final Rankings
            </Text>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th><Text size="lg" fw={700} c="dark">Rank</Text></th>
                  <th><Text size="lg" fw={700} c="dark">Name</Text></th>
                  <th><Text size="lg" fw={700} c="dark">W/L</Text></th>
                  <th><Text size="lg" fw={700} c="dark">Fights</Text></th>
                  <th><Text size="lg" fw={700} c="dark">Final ELO</Text></th>
                  <th><Text size="lg" fw={700} c="dark">ELO Change</Text></th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((student, index) => {
                  const isPositive = student.elo_change >= 0;
                  return (
                    <tr key={student.student_id}>
                      <td>
                        <RankBadge rank={index + 1} />
                      </td>
                      <td>
                        <Group gap="sm">
                          <Avatar
                            src={student.avatar_url}
                            alt={student.name}
                            size="md"
                            radius="xl"
                          >
                            {!student.avatar_url && student.name ? student.name.charAt(0) : ''}
                          </Avatar>
                          <Text size="lg" fw={500} c="dark">{student.name}</Text>
                        </Group>
                      </td>
                      <td>
                        <Group gap="xs">
                          <Text size="lg" fw={600} c="dark">{student.wins}</Text>
                          <Text size="lg" fw={500} c="dark">/</Text>
                          <Text size="lg" fw={600} c="dark">{student.losses}</Text>
                        </Group>
                      </td>
                      <td><Text size="lg" fw={500} c="dark">{student.fights_played}</Text></td>
                      <td><Text size="lg" fw={500} c="dark">{student.elo_rating}</Text></td>
                      <td>
                        <Group gap="xs">
                          {isPositive ? (
                            <IconArrowUp size={16} color="green" />
                          ) : (
                            <IconArrowDown size={16} color="red" />
                          )}
                          <Text c={isPositive ? 'green' : 'red'} fw={500}>
                            {isPositive ? '+' : ''}
                            {Math.round(student.elo_change)}
                          </Text>
                        </Group>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>

          {/* Finish Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button
              size="lg"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              onClick={onFinish}
            >
              Return to Arena
            </Button>
          </motion.div>
        </Stack>
      </Card>
    </motion.div>
  );
};
