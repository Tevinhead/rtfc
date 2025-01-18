import React, { useEffect, useMemo } from 'react';
import { Card, Text, Stack, Grid, Table, Center, Avatar, Group, Box, Badge, Title } from '@mantine/core';
import { motion } from 'framer-motion';
import { LineChart } from '@mantine/charts';
import { StatsCard } from '../shared/StatsCard';
import { Student } from '../../types';
import { useStudentStore } from '../../stores';
import { achievementsConfig } from '../../achievements/achievementsConfig';
import { getStudentAchievements } from '../../achievements/getStudentAchievements';

interface StudentStatsProps {
  student: Student;
}

export const StudentStats = React.memo(function StudentStats({ student }: StudentStatsProps) {
  // Store retrieval for match history
  const { studentHistory, fetchStudentHistory } = useStudentStore();
  const historyData = useMemo(
    () => studentHistory[student.id] || [],
    [studentHistory, student.id]
  );

  // Fetch match history if not already fetched
  useEffect(() => {
    void fetchStudentHistory(student.id);
  }, [student.id, fetchStudentHistory]);

  // Prepare data for ELO timeline chart
  const eloTimeline = useMemo(() => {
    return historyData.map((mh) => ({
      date: new Date(mh.date).toLocaleDateString(),
      elo: mh.new_elo,
    }));
  }, [historyData]);

  // Compute display of student's win-rate and record
  const winRateDisplay = useMemo(
    () => `${(student.win_rate * 100).toFixed(1)}%`,
    [student.win_rate]
  );
  const recordDisplay = useMemo(
    () => `${student.wins}W - ${student.losses}L`,
    [student.wins, student.losses]
  );

  // 1) Figure out which achievements are unlocked
  const unlockedIds = useMemo(() => {
    return getStudentAchievements(student, historyData);
  }, [student, historyData]);

  // 2) Build a combined list (locked + unlocked) with an `isUnlocked` flag
  const allAchievements = useMemo(() => {
    return achievementsConfig.map((achievement) => ({
      ...achievement,
      isUnlocked: unlockedIds.includes(achievement.id),
    }));
  }, [unlockedIds]);

  return (
    <Stack gap="lg">
      {/* AVATAR & NAME */}
      <Group gap="md" align="center" mb="xl">
        <Box
          style={{
            position: 'relative',
            padding: '4px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #4dabf7, #228be6)',
            boxShadow: '0 0 10px rgba(77, 171, 247, 0.3)'
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Avatar
              src={student.avatar_url || undefined}
              alt={student.name}
              radius="xl"
              size={90}
              style={{
                border: '2px solid #fff',
                boxShadow: '0 0 10px rgba(77, 171, 247, 0.2)'
              }}
            >
              {(!student.avatar_url && student.name) ? student.name.charAt(0) : ''}
            </Avatar>
          </motion.div>
        </Box>
        <Text 
          size="xl" 
          fw={700}
          style={{
            background: 'linear-gradient(45deg, #4dabf7, #228be6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {student.name}
        </Text>
      </Group>

      {/* Top Stats (Matches, Win Rate, ELO) */}
      <Grid>
        <Grid.Col span={4}>
          <StatsCard
            title="Total Matches"
            value={student.total_matches}
            icon="🎮"
            description="Career battles"
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <StatsCard
            title="Win Rate"
            value={winRateDisplay}
            icon="📊"
            description={recordDisplay}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <StatsCard
            title="ELO Rating"
            value={student.elo_rating}
            icon="🏆"
            description="Current ranking"
          />
        </Grid.Col>
      </Grid>

      {/* Achievements Section */}
      <Card withBorder radius="md" p="md">
        <Title order={3} mb="md">Achievements</Title>
        <Group gap="lg">
          {/* 
            3) Always display all achievements. 
               If isUnlocked = true, show normal style.
               Else, show a gray/"locked" style.
          */}
          {allAchievements.map((ach) => (
            <Card
              key={ach.id}
              shadow="md"
              p="md"
              radius="md"
              withBorder
              style={{
                width: 180,
                textAlign: 'center',
                background: ach.isUnlocked
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255,255,255,0.02)',
              }}
            >
              <Badge
                color={ach.isUnlocked ? ach.color : 'gray'}
                variant={ach.isUnlocked ? 'filled' : 'outline'}
                size="lg"
                style={{ fontSize: '1rem', marginBottom: '0.5rem' }}
                leftSection={ach.isUnlocked ? undefined : null}
              >
                {ach.title}
              </Badge>
              <Text
                size="sm"
                color={ach.isUnlocked ? 'dimmed' : 'gray'}
              >
                {ach.description}
              </Text>
              {/* 
                If not unlocked, let's show a small "Locked" label 
                or any subtle hint that it's not unlocked yet
              */}
              {!ach.isUnlocked && (
                <Text size="xs" color="dimmed" mt="xs">
                  Locked
                </Text>
              )}
            </Card>
          ))}
        </Group>
      </Card>

      {/* ELO Timeline Chart */}
      <Card withBorder radius="md" p="md">
        <Text size="lg" fw={700} mb="md">
          ELO Timeline
        </Text>
        {eloTimeline.length < 2 ? (
          <Center>
            <Text size="sm" color="dimmed">
              Not enough data to show chart
            </Text>
          </Center>
        ) : (
          <LineChart
            data={eloTimeline}
            dataKey="date"
            series={[{ name: 'elo', color: 'blue' }]}
            w="100%"
            h={300}
          />
        )}
      </Card>

      {/* Match History Table */}
      <Card withBorder radius="md" p="md">
        <Text size="lg" fw={700} mb="md">
          Match History
        </Text>
        {historyData.length === 0 ? (
          <Text size="sm" color="dimmed">
            No match history yet.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Opponent</th>
                <th>Result</th>
                <th>Old ELO</th>
                <th>Change</th>
                <th>New ELO</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((mh) => (
                <tr key={mh.match_id}>
                  <td>{new Date(mh.date).toLocaleDateString()}</td>
                  <td>{mh.opponent_name}</td>
                  <td style={{ color: mh.result === 'win' ? 'green' : 'red' }}>
                    {mh.result.toUpperCase()}
                  </td>
                  <td>{mh.old_elo.toFixed(1)}</td>
                  <td>
                    {mh.elo_change > 0 ? `+${mh.elo_change}` : mh.elo_change}
                  </td>
                  <td>{mh.new_elo.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );
});
