import React from 'react';
import { Button } from '@mantine/core';
import { buttonStyles } from './styles';

interface ArenaStartButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const ArenaStartButton: React.FC<ArenaStartButtonProps> = ({
  onClick,
  isLoading = false
}) => {
  return (
    <Button
      onClick={onClick}
      variant="gradient"
      gradient={{ from: 'violet', to: 'indigo', deg: 45 }}
      loading={isLoading}
      size="xl"
      fullWidth
      mt="xl"
      styles={buttonStyles}
      data-testid="start-arena-button"
    >
      Start Arena Battle
    </Button>
  );
};