import React, { useState, useCallback, useMemo } from 'react';
import { Card, Text, Stack, Group, Box, Tooltip, ActionIcon } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconRefresh } from '@tabler/icons-react';
import { Flashcard } from '../../../types';

interface FlashcardDisplayProps {
  flashcard: Flashcard;
}

export const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  flashcard,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const getFontSize = useCallback((text: string) => {
    const length = text.length;
    if (length > 200) return '32px';
    if (length > 100) return '48px';
    if (length > 50) return '64px';
    return '96px';
  }, []);

  const sharedTextStyle = {
    flexGrow: 1,
    wordBreak: 'break-word' as const,
    maxHeight: '100%',
    overflowY: 'auto' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    lineHeight: 1.2,
  };

  return (
    <Box
      style={{
        perspective: '1000px',
        width: '100%',
        height: '420px',
        position: 'relative',
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s ease',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front side: question */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backfaceVisibility: 'hidden',
          }}
        >
          <Card
            shadow="lg"
            p="md"
            radius="md"
            withBorder
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #FEE140 0%, #FA709A 100%)',
              color: '#333',
              boxSizing: 'border-box',
            }}
          >
            <Stack gap="xs" style={{ height: '100%' }}>
              <Text
                size={getFontSize(flashcard.question)}
                fw={800}
                ta="center"
                style={sharedTextStyle}
              >
                {flashcard.question}
              </Text>
              <Group justify="center">
                <Tooltip label="Flip to see Answer" withArrow>
                  <ActionIcon variant="light" onClick={handleFlip}>
                    <IconRefresh size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>
          </Card>
        </motion.div>

        {/* Back side: answer */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Card
            shadow="lg"
            p="xl"
            radius="md"
            withBorder
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #A1FFCE 0%, #FAFFD1 100%)',
              color: '#333',
              boxSizing: 'border-box',
            }}
          >
            <Stack gap="md" style={{ height: '100%' }}>
              <Text
                size={getFontSize(flashcard.answer)}
                fw={800}
                ta="center"
                style={sharedTextStyle}
              >
                {flashcard.answer}
              </Text>
              <Group justify="center">
                <Tooltip label="Flip to see Question" withArrow>
                  <ActionIcon variant="light" onClick={handleFlip}>
                    <IconRefresh size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>
          </Card>
        </motion.div>
      </motion.div>
    </Box>
  );
};
