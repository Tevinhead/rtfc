import React from 'react';
import { Container, Paper } from '@mantine/core';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Navigation>
      <Container size="xl" py="xl">
        <Paper shadow="xs" p="md" radius="md">
          {children}
        </Paper>
      </Container>
    </Navigation>
  );
}
