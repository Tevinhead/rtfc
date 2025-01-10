import React, { useEffect, useMemo } from 'react';
import { Card, Text, Stack, Grid, Table, Center } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { StatsCard } from '../shared/StatsCard';
import { Student } from '../../types';
import { useStudentStore } from '../../stores';

interface StudentStatsProps {
  student: Student;
}

export const StudentStats = React.memo(function StudentStats({ student }: StudentStatsProps) {
  const { studentHistory, fetchStudentHistory } = useStudentStore();
  const historyData = useMemo(() => 
    studentHistory[student.id] || [],
    [studentHistory, student.id]
  );

  useEffect(() => {
    if (student.id && !historyData.length) {
      void fetchStudentHistory(student.id);
    }
  }, [student.id, historyData.length, fetchStudentHistory]);

  // Calculate line chart data for ELO over time
  const eloTimeline = useMemo(() => {
    return historyData.map((mh) => ({
      date: new Date(mh.date).toLocaleDateString(),
      elo: mh.new_elo,
    }));
  }, [historyData]);

  const winRateDisplay = useMemo(() => 
    `${(student.win_rate * 100).toFixed(1)}%`,
    [student.win_rate]
  );

  const recordDisplay = useMemo(() => 
    `${student.wins}W - ${student.losses}L`,
    [student.wins, student.losses]
  );

  return (
    <Stack gap="lg">
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

      {/* ELO Over Time */}
      <Card withBorder radius="md" p="md">
        <Text size="lg" fw={700} mb="md">
          ELO Timeline
        </Text>

        {eloTimeline.length < 2 ? (
          <Center><Text size="sm" color="dimmed">Not enough data to show chart</Text></Center>
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

      {/* Match-by-Match Table */}
      <Card withBorder radius="md" p="md">
        <Text size="lg" fw={700} mb="md">
          Match History
        </Text>
        {historyData.length === 0 ? (
          <Text size="sm" color="dimmed">No match history yet.</Text>
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
                  <td>{mh.elo_change > 0 ? `+${mh.elo_change}` : mh.elo_change}</td>
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
