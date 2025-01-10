import React, { useMemo } from 'react';
import { Card, Text, Group, Stack, Button } from '@mantine/core';
import { StatsCard } from '../shared/StatsCard';
import { Student } from '../../types';

interface StudentCardProps {
  student: Student;
  onViewStats?: () => void;
  onSelectForBattle?: () => void;
  onEdit?: () => void;
  isSelected?: boolean;
}

export const StudentCard = React.memo(function StudentCard({ 
  student, 
  onViewStats, 
  onSelectForBattle, 
  onEdit,
  isSelected = false
}: StudentCardProps) {
  const winRateDisplay = useMemo(() => {
    return `${(student.win_rate * 100).toFixed(1)}%`;
  }, [student.win_rate]);

  const recordDisplay = useMemo(() => {
    return `${student.wins}W - ${student.losses}L`;
  }, [student.wins, student.losses]);

  const actionButtons = useMemo(() => (
    <Group>
      {onEdit && (
        <Button 
          variant="light" 
          onClick={onEdit}
          color="blue"
        >
          Edit
        </Button>
      )}
      {onSelectForBattle && (
        <Button 
          variant="light"
          color={isSelected ? "green" : "blue"}
          onClick={onSelectForBattle}
          disabled={isSelected}
        >
          {isSelected ? "Selected" : "Select for Battle"}
        </Button>
      )}
    </Group>
  ), [onEdit, onSelectForBattle, isSelected]);
  return (
    <Card 
      withBorder 
      radius="md" 
      p="md"
      style={isSelected ? { border: '2px solid #40a9ff' } : undefined}
    >
      <Stack>
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="lg" fw={700}>
              {student.name}
            </Text>
          </div>
          {actionButtons}
        </Group>

        <Group grow>
          <StatsCard
            title="ELO Rating"
            value={student.elo_rating}
            icon="🏆"
            description="Current ranking points"
          />
          <StatsCard
            title="Win Rate"
            value={winRateDisplay}
            icon="📊"
            description={recordDisplay}
          />
        </Group>

        {onViewStats && (
          <Button 
            variant="subtle" 
            onClick={onViewStats}
            fullWidth
          >
            View Detailed Stats
          </Button>
        )}
      </Stack>
    </Card>
  );
});
