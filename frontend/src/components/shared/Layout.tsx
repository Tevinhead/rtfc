import React from 'react';
import { Container, useMantineTheme } from '@mantine/core';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const theme = useMantineTheme();
  
  return (
    <Navigation>
      <Container
        fluid
        p={0}
        style={{
          background: `linear-gradient(165deg, ${theme.colors.custom[9]} 0%, ${theme.colors.custom[8]} 100%)`,
          minHeight: '100vh',
          maxWidth: '100vw'
        }}
      >
        {children}
      </Container>
    </Navigation>
  );
}
