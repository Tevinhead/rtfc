import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  Center,
  Stack,
  Title,
  Text,
  Grid,
  Avatar,
  Badge,
  Group,
  Modal,
  rem,
} from '@mantine/core';
import { motion } from 'framer-motion';
import { IconTrophy, IconArrowUp, IconArrowDown } from '@tabler/icons-react';

import { useStudentStore } from '../stores';
import { Student } from '../types';
import { StudentStats } from '../components/students/StudentStats';

/**
 * A small helper to select a nice color/badge/icon for top ranks
 */
function getRankBadge(rank: number) {
  if (rank === 1) {
    return { color: 'yellow', icon: <IconTrophy size={16} /> };
  } else if (rank === 2) {
    return { color: 'gray', icon: <IconTrophy size={16} /> };
  } else if (rank === 3) {
    return { color: 'orange', icon: <IconTrophy size={16} /> };
  }
  return { color: 'blue', icon: null };
}

export function LeaderboardPage() {
  // Pull students out of your student store
  const { students, loading, error, fetchStudents } = useStudentStore();

  // For displaying a modal with detailed stats
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  // Sort students by ELO descending
  const sortedStudents = useMemo(() => {
    const clone = [...students];
    clone.sort((a, b) => b.elo_rating - a.elo_rating);
    return clone;
  }, [students]);

  // Handler to open the Stats modal
  const handleViewStats = useCallback((student: Student) => {
    setSelectedStudent(student);
    setStatsModalOpen(true);
  }, []);

  // Handler to close the Stats modal
  const handleCloseStats = useCallback(() => {
    setStatsModalOpen(false);
    setSelectedStudent(null);
  }, []);

  // If there's an error, show it
  if (error) {
    return (
      <Center py="xl">
        <Text color="red" size="lg">
          {error}
        </Text>
      </Center>
    );
  }

  return (
    <Box
      py="xl"
      style={{ minHeight: '70vh' }}
      data-testid="leaderboard-page"
    >
      <Card w="90%" maw={1200} mx="auto" p="md" withBorder radius="md">
        <Stack gap="md">
          <Title order={2} ta="center">
            Leaderboard
          </Title>
          <Text c="dimmed" ta="center">
            Top ELO Ratings Among All Students
          </Text>

          {loading && (
            <Center>
              <Text size="md">Loading...</Text>
            </Center>
          )}

          {/* Our ranking list */}
          {!loading && sortedStudents.length > 0 && (
            <Grid>
              {sortedStudents.map((student, index) => {
                const rank = index + 1;
                const { color, icon } = getRankBadge(rank);

                // We'll animate each item with framer-motion
                return (
                  <Grid.Col key={student.id} span={{ base: 12, md: 6 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card
                        withBorder
                        shadow="md"
                        p="xl"
                        onClick={() => handleViewStats(student)}
                        styles={{
                          root: {
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 'var(--mantine-shadow-lg)'
                            }
                          }
                        }}
                      >
                        <Group justify="space-between" mb="md">
                          {/* RANK BADGE */}
                          <Badge
                            color={color}
                            variant={icon ? 'filled' : 'light'}
                            size="lg"
                            leftSection={icon}
                          >
                            #{rank}
                          </Badge>
                          {/* ELO - with a possible up/down arrow if you wanted */}
                          <Group gap={4}>
                            <Text fw={700} c="teal" size="lg">
                              {student.elo_rating}
                            </Text>
                            {rank === 1 ? (
                              <IconArrowUp size={16} color="green" />
                            ) : null}
                          </Group>
                        </Group>

                        <Group align="center">
                          {/* AVATAR */}
                          <Avatar
                            src={student.avatar_url || undefined}
                            alt={student.name}
                            radius="xl"
                            size={64}
                          >
                            {/* fallback letter if no avatar */}
                            {(!student.avatar_url && student.name)
                              ? student.name.charAt(0)
                              : ''}
                          </Avatar>
                          <Stack gap={0} ml="md">
                            {/* NAME */}
                            <Text size="lg" fw={700}>
                              {student.name}
                            </Text>
                            {/* W/L Record (optional) */}
                            <Text size="xs" c="dimmed">
                              {student.wins}W - {student.losses}L
                            </Text>
                          </Stack>
                        </Group>
                      </Card>
                    </motion.div>
                  </Grid.Col>
                );
              })}
            </Grid>
          )}

          {/* If no students found */}
          {!loading && sortedStudents.length === 0 && (
            <Center>
              <Text c="dimmed">No students available.</Text>
            </Center>
          )}
        </Stack>
      </Card>

      {/* Modal to show the StudentStats */}
      <Modal
        opened={statsModalOpen}
        onClose={handleCloseStats}
        size="xl"
        title={selectedStudent ? `${selectedStudent.name}'s Statistics` : 'Statistics'}
      >
        {selectedStudent && <StudentStats student={selectedStudent} />}
      </Modal>
    </Box>
  );
}