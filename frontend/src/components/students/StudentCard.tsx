import React, { useMemo } from 'react';
import { Card, Text, Group, Stack, Button, Avatar, Box, useMantineTheme } from '@mantine/core';
import { StatsCard } from '../shared/StatsCard';
import { Student } from '../../types';

interface StudentCardProps {
  student: Student;
  onViewStats?: () => void;
  onSelectForBattle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReset?: () => void;
  isSelected?: boolean;
}

export const StudentCard = React.memo(function StudentCard({
  student,
  onViewStats,
  onSelectForBattle,
  onEdit,
  onDelete,
  onReset,
  isSelected = false
}: StudentCardProps) {
  const theme = useMantineTheme();
  
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
      p="xl"
      style={{
        backgroundColor: theme.colors.custom[8],
        border: isSelected ? `2px solid ${theme.colors.custom[5]}` : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Group gap="md">
            <Avatar
              src={student.avatar_url || undefined}
              alt={student.name}
              radius="xl"
              size={60}
              style={{
                border: `2px solid ${theme.colors.custom[5]}`,
                boxShadow: `0 0 10px ${theme.colors.custom[5]}30`
              }}
            >
              {(!student.avatar_url && student.name) ? student.name.charAt(0) : ''}
            </Avatar>
            <Text 
              size="xl" 
              fw={700}
              c="custom.0"
            >
              {student.name}
            </Text>
          </Group>

          <Group gap="xs">
            {onEdit && (
              <Button 
                variant="filled" 
                onClick={onEdit} 
                color="custom.5"
                size="sm"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="filled" 
                onClick={onDelete} 
                color="red.7"
                size="sm"
              >
                Delete
              </Button>
            )}
            {onReset && (
              <Button 
                variant="filled" 
                onClick={onReset} 
                style={{
                  backgroundColor: '#9B8D27'
                }}
                size="sm"
              >
                Reset Stats
              </Button>
            )}
          </Group>
        </Group>

        <Group grow gap="md">
          <StatsCard
            title="ELO RATING"
            value={student.elo_rating}
            icon="🏆"
            description="Current ranking points"
          />
          <StatsCard
            title="WIN RATE"
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
            color="custom.5"
            style={{
              marginTop: theme.spacing.xs
            }}
          >
            View Detailed Stats
          </Button>
        )}

        {onSelectForBattle && (
          <Button
            variant="filled"
            color="custom.5"
            onClick={onSelectForBattle}
            disabled={isSelected}
            fullWidth
          >
            {isSelected ? 'Selected' : 'Select for Battle'}
          </Button>
        )}
      </Stack>
    </Card>
  );
});
