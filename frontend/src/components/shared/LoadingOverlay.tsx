import React from 'react';
import { Center, Loader, Text, Stack, Box, MantineSize } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  size?: MantineSize;
  overlay?: boolean;
  loaderSize?: number;
  blur?: boolean;
}

export function LoadingOverlay({
  visible,
  message = 'Loading...',
  size = 'md',
  overlay = false,
  loaderSize = 36,
  blur = true
}: LoadingOverlayProps) {
  const MotionStack = motion(Stack) as any; // Type assertion needed for framer-motion

  return (
    <AnimatePresence>
      {visible && (
        <Box
          pos={overlay ? 'absolute' : 'relative'}
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            backgroundColor: overlay ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
            backdropFilter: overlay && blur ? 'blur(2px)' : 'none',
            zIndex: 1000,
            minHeight: overlay ? '100%' : '200px',
          }}
        >
          <Center h="100%">
            <MotionStack
              align="center"
              gap="sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Loader size={loaderSize} />
              {message && (
                <Text size={size} c="dimmed" ta="center">
                  {message}
                </Text>
              )}
            </MotionStack>
          </Center>
        </Box>
      )}
    </AnimatePresence>
  );
}
