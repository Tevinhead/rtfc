import React from 'react';
import { motion } from 'framer-motion';
import { Card, Text, Stack, Button, Group, Badge, Grid, Table } from '@mantine/core';
import { IconTrophy, IconArrowUp, IconArrowDown, IconConfetti } from '@tabler/icons-react';

interface StudentStats {
  student_id: string;
  name: string;
  elo_rating: number;
  wins: number;
  losses: number;
  fights_played: number;
  elo_change: number;
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
        maxWidth: '95%',
        margin: '0 auto',
        padding: '2rem',
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
                    <Text size="xl" fw={700}>
                      {student.name}
                    </Text>
                    <Badge size="lg" variant="filled" color="blue">
                      {student.elo_rating} ELO
                    </Badge>
                    <Group>
                      <Badge color="green">Wins: {student.wins}</Badge>
                      <Badge color="red">Losses: {student.losses}</Badge>
                    </Group>
                    <Text
                      size="lg"
                      c={student.elo_change >= 0 ? 'green' : 'red'}
                      fw={700}
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
            <Text size="lg" fw={700} mb="md">
              Final Rankings
            </Text>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>W/L</th>
                  <th>Fights</th>
                  <th>Final ELO</th>
                  <th>ELO Change</th>
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
                      <td>{student.name}</td>
                      <td>
                        <Group gap="xs">
                          <Text c="green">{student.wins}</Text>
                          <Text>/</Text>
                          <Text c="red">{student.losses}</Text>
                        </Group>
                      </td>
                      <td>{student.fights_played}</td>
                      <td>{student.elo_rating}</td>
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
