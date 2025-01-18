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
    if (length > 200) return 'min(7vh, 64px)';
    if (length > 100) return 'min(9vh, 80px)';
    if (length > 50) return 'min(11vh, 96px)';
    return 'min(13vh, 112px)';
  }, []);

  const sharedTextStyle = {
    flexGrow: 1,
    wordBreak: 'break-word' as const,
    maxHeight: '100%',
    overflowY: 'auto' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'min(2vh, 0.5rem)',
    lineHeight: 1.2,
    width: '100%',
    height: '100%'
  };

  return (
    <Box
      style={{
        perspective: '1000px',
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
            shadow="sm"
            p={{ base: 'xs', sm: 'md' }}
            radius="sm"
            withBorder
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4444 100%)',
              color: '#fff',
              boxSizing: 'border-box',
              cursor: 'pointer',
              position: 'relative',
              borderRadius: 'min(2vh, 12px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            onClick={handleFlip}
          >
            <Text
              size={getFontSize(flashcard.question)}
              fw={700}
              ta="center"
              style={{
                ...sharedTextStyle,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              {flashcard.question}
            </Text>
            <Tooltip label="Flip to see Answer" withArrow position="bottom">
              <ActionIcon
                variant="subtle"
                color="gray.0"
                style={{
                  position: 'absolute',
                  bottom: '5px',
                  right: '5px',
                  opacity: 0.7,
                }}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
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
            shadow="sm"
            p={{ base: 'xs', sm: 'md' }}
            radius="sm"
            withBorder
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #66bb6a 0%, #4CAF50 100%)',
              color: '#fff',
              boxSizing: 'border-box',
              cursor: 'pointer',
              position: 'relative',
              borderRadius: 'min(2vh, 12px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            onClick={handleFlip}
          >
            <Text
              size={getFontSize(flashcard.answer)}
              fw={700}
              ta="center"
              style={{
                ...sharedTextStyle,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              {flashcard.answer}
            </Text>
            <Tooltip label="Flip to see Question" withArrow position="bottom">
              <ActionIcon
                variant="subtle"
                color="gray.0"
                style={{
                  position: 'absolute',
                  bottom: '5px',
                  right: '5px',
                  opacity: 0.7,
                }}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Card>
        </motion.div>
      </motion.div>
    </Box>
  );
};
