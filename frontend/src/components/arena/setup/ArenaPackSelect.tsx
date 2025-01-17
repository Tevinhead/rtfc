import React from 'react';
import { Select } from '@mantine/core';
import { inputStyles } from './styles';

interface ArenaPackSelectProps {
  packSelectData: { value: string; label: string }[];
  selectedPackId: string;
  onPackChange: (value: string | null) => void;
  error?: string;
}

export const ArenaPackSelect: React.FC<ArenaPackSelectProps> = ({
  packSelectData,
  selectedPackId,
  onPackChange,
  error
}) => {
  return (
    <Select
      label="Select a Flashcard Pack"
      placeholder="Choose your battle deck"
      data={packSelectData}
      value={selectedPackId}
      onChange={onPackChange}
      error={error}
      required
      size="lg"
      styles={inputStyles}
    />
  );
};