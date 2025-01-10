import React from 'react';
import { motion } from 'framer-motion';
import { Card, Text, Stack, Button, Group, Badge, Grid, Table } from '@mantine/core';
import { IconTrophy, IconArrowUp, IconArrowDown } from '@tabler/icons-react';

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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}
    >
      <Card shadow="lg" p="xl" radius="md" withBorder>
        <Stack align="center" gap="xl">
          {/* Title */}
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 15
            }}
          >
            <Text
              size="xl"
              fw={900}
              variant="gradient"
              gradient={{ from: 'gold', to: 'yellow', deg: 45 }}
              ta="center"
              style={{ fontSize: '3rem' }}
            >
              Arena Complete!
            </Text>
          </motion.div>

          {/* Top 3 Podium */}
          <Grid gutter="xl" style={{ width: '100%' }}>
            {sortedResults.slice(0, 3).map((student, index) => (
              <Grid.Col key={student.student_id} span={4}>
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Stack align="center" gap="md">
                    <RankBadge rank={index + 1} />
                    <Text size="xl" fw={700}>{student.name}</Text>
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
                      {student.elo_change > 0 ? '+' : ''}{Math.round(student.elo_change)} ELO
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* Full Results Table */}
          <Card shadow="sm" p="lg" radius="md" withBorder style={{ width: '100%' }}>
            <Text size="lg" fw={700} mb="md">Final Rankings</Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Rank</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>W/L</Table.Th>
                  <Table.Th>Fights</Table.Th>
                  <Table.Th>Final ELO</Table.Th>
                  <Table.Th>ELO Change</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedResults.map((student, index) => (
                  <Table.Tr key={student.student_id}>
                    <Table.Td>
                      <RankBadge rank={index + 1} />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{student.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text c="green">{student.wins}</Text>
                        <Text>/</Text>
                        <Text c="red">{student.losses}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{student.fights_played}</Table.Td>
                    <Table.Td>
                      <Text fw={500}>{student.elo_rating}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {student.elo_change >= 0 ? (
                          <IconArrowUp size={16} color="green" />
                        ) : (
                          <IconArrowDown size={16} color="red" />
                        )}
                        <Text 
                          c={student.elo_change >= 0 ? 'green' : 'red'}
                          fw={500}
                        >
                          {student.elo_change > 0 ? '+' : ''}{Math.round(student.elo_change)}
                        </Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>

          {/* Finish Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
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
