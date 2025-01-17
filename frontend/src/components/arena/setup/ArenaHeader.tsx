import React from 'react';
import { Box, Text, MantineTheme } from '@mantine/core';

export const ArenaHeader: React.FC = () => {
  return (
    <Box
      style={{
        position: 'relative',
        width: 400,
        height: 120
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120,
          height: 120,
          background: 'radial-gradient(circle, rgba(112, 72, 232, 0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
          zIndex: 0
        }}
      />
      <Text
        component="h1"
        size="3rem"
        fw={900}
        variant="gradient"
        gradient={{ from: 'violet', to: 'indigo', deg: 45 }}
        styles={(theme: MantineTheme) => ({
          root: {
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1
          }
        })}
      >
        Flashcard Battle Setup
      </Text>
    </Box>
  );
};