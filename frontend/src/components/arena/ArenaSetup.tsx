import React, { useCallback, useState, useEffect } from 'react';
import { Stack, Box, Paper } from '@mantine/core';
import { useArenaSetup } from '../../hooks/useArenaSetup';
import { useStudentStore } from '../../stores';
import { containerStyles, paperStyles } from './setup/styles';
import {
  ArenaHeader,
  ArenaPackSelect,
  ArenaRoundsInput,
  ArenaPlayerSelect,
  ArenaStartButton
} from './setup';

interface ArenaSetupProps {
  onStart: (packId: string, playerIds: string[], rounds: number) => void;
  isLoading?: boolean;
}

export const ArenaSetup: React.FC<ArenaSetupProps> = ({ onStart, isLoading = false }) => {
  const {
    selectedPackId,
    numRounds,
    validationErrors,
    packSelectData,
    handlePackChange,
    handleRoundsChange,
    getSetupData,
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
    <Stack
      gap="xl"
      data-testid="arena-setup"
      p="xl"
      styles={containerStyles}
    >
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top left, rgba(95, 75, 255, 0.15), transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <Stack align="center" mb="xl">
        <ArenaHeader />
      </Stack>

      <Paper p="xl" radius="md" styles={paperStyles}>
        <Stack gap="xl">
          <ArenaPackSelect
            packSelectData={packSelectData}
            selectedPackId={selectedPackId}
            onPackChange={handlePackChange}
            error={validationErrors.pack}
          />

          <ArenaRoundsInput
            numRounds={numRounds}
            onRoundsChange={handleRoundsChange}
            error={validationErrors.rounds}
          />

          <ArenaPlayerSelect
            students={students}
            selectedPlayerIds={selectedPlayerIds}
            onTogglePlayer={toggleStudent}
          />
        </Stack>
      </Paper>

      <ArenaStartButton
        onClick={handleStartClick}
        isLoading={isLoading}
      />
    </Stack>
  );
};
