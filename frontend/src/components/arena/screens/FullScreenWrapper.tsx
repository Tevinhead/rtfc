import React, { ReactNode } from 'react';
import { Stack, MantineTheme } from '@mantine/core';

interface FullScreenWrapperProps {
  children: ReactNode;
}

export function FullScreenWrapper({ children }: FullScreenWrapperProps) {
  return (
    <Stack
      justify="center"
      align="center"
      styles={(theme: MantineTheme) => ({
        root: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          gap: theme.spacing.md,
          width: '100%',
          height: '100%',
          padding: theme.spacing.lg,
        },
      })}
    >
      {children}
    </Stack>
  );
}