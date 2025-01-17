import React from 'react';
import { NumberInput } from '@mantine/core';
import { inputStyles } from './styles';

interface ArenaRoundsInputProps {
  numRounds: number;
  onRoundsChange: (value: number | string) => void;
  error?: string;
}

export const ArenaRoundsInput: React.FC<ArenaRoundsInputProps> = ({
  numRounds,
  onRoundsChange,
  error
}) => {
  return (
    <NumberInput
      label="Number of Rounds"
      description="Choose how many rounds of battle (1-20)"
      min={1}
      max={20}
      value={numRounds}
      onChange={onRoundsChange}
      error={error}
      required
      size="lg"
      styles={inputStyles}
    />
  );
};