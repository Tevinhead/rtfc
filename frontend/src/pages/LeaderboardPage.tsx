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
  useMantineTheme,
  rem,
  Modal,
  rgba,
} from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { useStudentStore } from '../stores';
import { Student } from '../types';
import { StudentStats } from '../components/students/StudentStats';
import type { MantineTheme } from '@mantine/core';

export function LeaderboardPage() {
  const theme = useMantineTheme();

  const { students, loading, error, fetchStudents } = useStudentStore();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const sortedStudents = useMemo(() => {
    const clone = [...students];
    clone.sort((a, b) => b.elo_rating - a.elo_rating);
    return clone;
  }, [students]);

  const topThree = useMemo(() => sortedStudents.slice(0, 3), [sortedStudents]);
  const rest = useMemo(() => sortedStudents.slice(3), [sortedStudents]);

  const handleViewStats = useCallback((student: Student) => {
    setSelectedStudent(student);
    setStatsModalOpen(true);
  }, []);

  const handleCloseStats = useCallback(() => {
    setStatsModalOpen(false);
    setSelectedStudent(null);
  }, []);

  const getRankBadgeProps = (rank: number) => {
    switch (rank) {
      case 1:
        return { color: 'yellow', icon: <IconTrophy size={16} /> };
      case 2:
        return { color: 'gray', icon: <IconTrophy size={16} /> };
      case 3:
        return { color: 'orange', icon: <IconTrophy size={16} /> };
      default:
        return { color: 'blue', icon: null };
    }
  };

  const columns: DataTableColumn<Student>[] = [
    {
      accessor: 'rank',
      title: 'Rank',
      textAlign: 'center',
      width: 80,
      render: (student) => {
        const rankInFullList = sortedStudents.indexOf(student) + 1;
        const { color, icon } = getRankBadgeProps(rankInFullList);
        return (
          <Badge
            color={color}
            size="lg"
            variant={icon ? 'filled' : 'light'}
            leftSection={icon}
            style={{
              fontWeight: 700,
              fontSize: rem(14),
            }}
          >
            #{rankInFullList}
          </Badge>
        );
      },
    },
    {
      accessor: 'name',
      title: 'Name',
      width: 240,
      render: (student) => (
        <Group gap="sm">
          <Avatar
            src={student.avatar_url || undefined}
            alt={student.name}
            size={36}
            radius="xl"
          >
            {(!student.avatar_url && student.name)
              ? student.name.charAt(0)
              : ''}
          </Avatar>
          <Text fw={600}>{student.name}</Text>
        </Group>
      ),
    },
    {
      accessor: 'elo_rating',
      title: 'ELO Rating',
      width: 120,
      textAlign: 'center',
      render: (student) => (
        <Text size="sm" fw={700} color="teal">
          {student.elo_rating}
        </Text>
      ),
    },
    {
      accessor: 'wins',
      title: 'Wins',
      textAlign: 'center',
    },
    {
      accessor: 'losses',
      title: 'Losses',
      textAlign: 'center',
    },
    {
      accessor: 'total_matches',
      title: 'Matches',
      textAlign: 'center',
    },
  ];

  if (error) {
    return (
      <Center h="50vh">
        <Text color="red">{error}</Text>
      </Center>
    );
  }

  return (
    <Box
      style={{
        minHeight: '70vh',
        padding: theme.spacing.xl,
        background: `linear-gradient(135deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[9]} 100%)`,
      }}
    >
      <Card withBorder radius="md" p="xl">
        <Stack gap="md">
          <Title order={2} ta="center" mb="sm">
            Gaming Leaderboard
          </Title>
          <Text c="dimmed" ta="center">
            Compare top ELO Ratings among students
          </Text>

          {topThree.length > 0 && (
            <Grid mt="md" gutter="xl">
              {topThree.map((student, index) => {
                const rank = index + 1;
                const { color, icon } = getRankBadgeProps(rank);

                return (
                  <Grid.Col
                    key={student.id}
                    span={12 / Math.min(topThree.length, 3)}
                  >
                    <Card
                      style={{
                        position: 'relative',
                        textAlign: 'center',
                        background: `linear-gradient(45deg, ${theme.colors.dark[6]}, ${theme.colors.dark[9]})`,
                        border: `1px solid ${theme.colors.gray[7]}`,
                        boxShadow: theme.shadows.md,
                        cursor: 'pointer',
                        transform: 'translateY(0)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows.xl,
                        },
                      }}
                      onClick={() => handleViewStats(student)}
                    >
                      <Stack gap="xs" align="center">
                        <Badge
                          color={color}
                          size="lg"
                          variant={icon ? 'filled' : 'light'}
                          leftSection={icon}
                          style={{
                            fontWeight: 700,
                            fontSize: rem(14),
                          }}
                        >
                          #{rank}
                        </Badge>
                        <Avatar
                          src={student.avatar_url || undefined}
                          alt={student.name}
                          size={80}
                          radius="xl"
                        >
                          {(!student.avatar_url && student.name)
                            ? student.name.charAt(0)
                            : ''}
                        </Avatar>
                        <Text size="lg" fw={700}>
                          {student.name}
                        </Text>
                        <Text
                          size="xl"
                          fw={800}
                          variant="gradient"
                          gradient={{ from: 'blue.4', to: 'cyan.4', deg: 45 }}
                        >
                          {student.elo_rating} ELO
                        </Text>
                        <Group gap="xs">
                          <Text size="sm" c="green">
                            {student.wins}W
                          </Text>
                          <Text size="sm" c="red">
                            {student.losses}L
                          </Text>
                          <Text size="sm" c="dimmed">
                            {student.total_matches} total
                          </Text>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>
          )}

          {rest.length > 0 && (
            <DataTable<Student>
              minHeight={150}
              records={rest}
              fetching={loading}
              onRowClick={({ record }) => handleViewStats(record)}
              columns={columns}
              highlightOnHover
              rowStyle={() => ({
                backgroundColor: 'transparent',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: rgba(theme.colors.gray[8], 0.5),
                },
              })}
            />
          )}

          {!loading && sortedStudents.length === 0 && (
            <Center>
              <Text c="dimmed">No students available.</Text>
            </Center>
          )}
        </Stack>
      </Card>

      <Modal
        opened={statsModalOpen}
        onClose={handleCloseStats}
        size="xl"
        title={selectedStudent?.name ? `${selectedStudent.name}'s Statistics` : 'Statistics'}
      >
        {selectedStudent && <StudentStats student={selectedStudent} />}
      </Modal>
    </Box>
  );
}