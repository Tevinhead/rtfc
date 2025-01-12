import React, { useCallback, useState, useEffect } from 'react';
import {
  Stack,
  Title,
  Select,
  NumberInput,
  Button,
  Text,
  SimpleGrid,
  Card,
  Avatar,
  Group,
  Badge,
  Box,
  Alert,
  MantineTheme,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useArenaSetup } from '../../hooks/useArenaSetup';
import { useStudentStore } from '../../stores';
import { Student } from '../../types';

interface ArenaSetupProps {
  onStart: (packId: string, playerIds: string[], rounds: number) => void;
  isLoading?: boolean;
}

export const ArenaSetup: React.FC<ArenaSetupProps> = ({ onStart, isLoading = false }) => {
  const {
    selectedPackId,
    numRounds,
    selectedPlayerIds: oldSelectedIds,
    validationErrors,
    packSelectData,
    handlePackChange,
    handleRoundsChange,
    validateSetup,
    getSetupData,
    resetSetup,
  } = useArenaSetup();

  const { students, fetchStudents } = useStudentStore();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const toggleStudent = useCallback(
    (id: string) => {
      setSelectedPlayerIds((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    },
    [setSelectedPlayerIds]
  );

  const handleStartClick = () => {
    const data = getSetupData();
    if (!data.selectedPackId) {
      return;
    }
    if (selectedPlayerIds.length < 2) {
      window.alert('Please select at least 2 players for the Arena.');
      return;
    }
    if (numRounds < 1 || numRounds > 20) {
      window.alert('Rounds must be between 1 and 20');
      return;
    }

    onStart(data.selectedPackId, selectedPlayerIds, numRounds);
  };

  return (
    <Stack gap="md" data-testid="arena-setup">
      <Title order={2}>Flashcard Battle Setup</Title>

      <Select
        label="Select a Flashcard Pack"
        placeholder="Pick one"
        data={packSelectData}
        value={selectedPackId}
        onChange={handlePackChange}
        error={validationErrors.pack}
        required
      />

      <NumberInput
        label="Number of Rounds"
        min={1}
        max={20}
        value={numRounds}
        onChange={handleRoundsChange}
        error={validationErrors.rounds}
        required
      />

      <Box>
        <Text fw={500} mb="xs">
          Select Players (at least 2)
        </Text>
        {students.length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow">
            No students found. Please add some students first.
          </Alert>
        ) : (
          <SimpleGrid
            cols={3}
            style={{
              [`@media (max-width: 62.5em)`]: {
                gridTemplateColumns: 'repeat(2, 1fr)',
              },
              [`@media (max-width: 37.5em)`]: {
                gridTemplateColumns: 'repeat(1, 1fr)',
              },
            }}
          >
            {students.map((student: Student) => {
              const isSelected = selectedPlayerIds.includes(student.id);
              return (
                <Card
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  shadow={isSelected ? 'md' : 'sm'}
                  withBorder
                  styles={(theme: MantineTheme) => ({
                    root: {
                      cursor: 'pointer',
                      borderColor: isSelected ? theme.colors.teal[6] : undefined,
                      backgroundColor: isSelected
                        ? `${theme.colors.teal[0]}80`  // 50% opacity
                        : 'white',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isSelected ? 'md' : 'lg',
                      },
                    }
                  })}
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
                    <Stack gap={4}>
                      <Text fw={600}>{student.name}</Text>
                      <Badge color="teal" variant="light">
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

      <Button 
        onClick={handleStartClick}
        variant="filled"
        color="teal"
        loading={isLoading}
        data-testid="start-arena-button"
      >
        Start Arena
      </Button>
    </Stack>
  );
};
