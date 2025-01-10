import React from 'react';
import { Stack, Select, NumberInput, MultiSelect, Button, Title } from '@mantine/core';
import { useArenaSetup } from '../../hooks/useArenaSetup';

interface ArenaSetupProps {
  onStart: (packId: string, playerIds: string[], rounds: number) => void;
  isLoading?: boolean;
}

export const ArenaSetup: React.FC<ArenaSetupProps> = ({ onStart, isLoading = false }) => {
  const {
    selectedPackId,
    numRounds,
    selectedPlayerIds,
    validationErrors,
    studentSelectData,
    packSelectData,
    handlePackChange,
    handleRoundsChange,
    handlePlayersChange,
    validateSetup,
    getSetupData
  } = useArenaSetup();

  const handleStartClick = () => {
    if (!validateSetup()) return;
    const { selectedPackId, selectedPlayerIds, numRounds } = getSetupData();
    onStart(selectedPackId, selectedPlayerIds, numRounds);
  };

  return (
    <Stack gap="md">
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

      <MultiSelect
        label="Select Players"
        data={studentSelectData}
        value={selectedPlayerIds}
        onChange={handlePlayersChange}
        searchable
        clearable
        placeholder="Select players"
        error={validationErrors.players}
        required
      />

      <Button 
        onClick={handleStartClick} 
        variant="filled" 
        color="blue" 
        loading={isLoading}
      >
        Start Arena
      </Button>
    </Stack>
  );
};
