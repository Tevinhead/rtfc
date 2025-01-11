import React, { useMemo } from 'react';
import { Card, Text, Group, Stack, Button, Avatar, Box } from '@mantine/core';
import { StatsCard } from '../shared/StatsCard';
import { Student } from '../../types';

interface StudentCardProps {
  student: Student;
  onViewStats?: () => void;
  onSelectForBattle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
}

export const StudentCard = React.memo(function StudentCard({
  student,
  onViewStats,
  onSelectForBattle,
  onEdit,
  onDelete,
  isSelected = false
}: StudentCardProps) {
  const winRateDisplay = useMemo(() => {
    return `${(student.win_rate * 100).toFixed(1)}%`;
  }, [student.win_rate]);

  const recordDisplay = useMemo(() => {
    return `${student.wins}W - ${student.losses}L`;
  }, [student.wins, student.losses]);

  return (
    <Card
      withBorder
      radius="md"
      p="md"
      style={{
        border: isSelected ? '2px solid #40a9ff' : '1px solid #e9ecef',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Stack>
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <Box
              style={{
                position: 'relative',
                padding: '4px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #4dabf7, #228be6)',
                boxShadow: '0 0 10px rgba(77, 171, 247, 0.3)'
              }}
            >
              <Avatar
                src={student.avatar_url || undefined}
                alt={student.name}
                radius="xl"
                size={60}
                style={{
                  border: '2px solid #fff',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {(!student.avatar_url && student.name) ? student.name.charAt(0) : ''}
              </Avatar>
            </Box>
            <div>
              <Text 
                size="lg" 
                fw={700}
                style={{
                  background: 'linear-gradient(45deg, #4dabf7, #228be6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {student.name}
              </Text>
            </div>
          </Group>

          <Group>
            <Group>
              {onEdit && (
                <Button variant="light" onClick={onEdit} color="blue">
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="light" onClick={onDelete} color="red">
                  Delete
                </Button>
              )}
            </Group>
            {onSelectForBattle && (
              <Button
                variant="light"
                color={isSelected ? 'green' : 'blue'}
                onClick={onSelectForBattle}
                disabled={isSelected}
              >
                {isSelected ? 'Selected' : 'Select for Battle'}
              </Button>
            )}
          </Group>
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
          <Button variant="subtle" onClick={onViewStats} fullWidth>
            View Detailed Stats
          </Button>
        )}
      </Stack>
    </Card>
  );
});
