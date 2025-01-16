import React from 'react';
import { Container, Paper } from '@mantine/core';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Navigation>
      <Container
        size="xl"
        p={0}
        style={{
          background: 'linear-gradient(165deg, #1A1B1E 0%, #13151A 100%)',
          minHeight: '100vh'
        }}
      >
        {children}
      </Container>
    </Navigation>
  );
}
