import React from 'react';
import { SimpleGrid, Card, Group, Avatar, Stack, Text, Badge, Alert, Box } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Student } from '../../../types';
import { playerCardStyles } from './styles';

interface ArenaPlayerSelectProps {
  students: Student[];
  selectedPlayerIds: string[];
  onTogglePlayer: (id: string) => void;
}

export const ArenaPlayerSelect: React.FC<ArenaPlayerSelectProps> = ({
  students,
  selectedPlayerIds,
  onTogglePlayer
}) => {
  return (
    <Box mt="xl">
      <Text
        fw={700}
        mb="md"
        size="lg"
        variant="gradient"
        gradient={{ from: 'violet', to: 'indigo', deg: 45 }}
      >
        Select Players (at least 2)
      </Text>
      {students.length === 0 ? (
        <Alert icon={<IconAlertCircle size={16} />} color="yellow">
          No students found. Please add some students first.
        </Alert>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3 }}
          spacing={{ base: 'sm', sm: 'md', md: 'lg' }}
          mt="lg"
        >
          {students.map((student: Student) => {
            const isSelected = selectedPlayerIds.includes(student.id);
            return (
              <Card
                key={student.id}
                onClick={() => onTogglePlayer(student.id)}
                shadow={isSelected ? 'lg' : 'md'}
                withBorder
                p="lg"
                style={{
                  cursor: 'pointer',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.2s ease'
                }}
                styles={(theme) => playerCardStyles(theme, isSelected)}
              >
                <Group>
                  <Avatar
                    radius="xl"
                    size={50}
                    src={student.avatar_url}
                    alt={student.name}
                  >
                    {(!student.avatar_url && student.name) ? student.name.charAt(0) : ''}
                  </Avatar>
                  <Stack gap="xs">
                    <Text size="lg" fw={700} c="white">{student.name}</Text>
                    <Badge
                      size="lg"
                      variant="gradient"
                      gradient={{ from: 'violet', to: 'indigo', deg: 45 }}
                    >
                      ELO: {student.elo_rating}
                    </Badge>
                  </Stack>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
};