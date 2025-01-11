import React, { useCallback, useMemo, useState } from 'react';
import {
  Grid,
  Card,
  Text,
  Group,
  ActionIcon,
  Progress,
  Tooltip,
  Stack,
  Box,
  Badge,
  rem,
} from '@mantine/core';
import { IconChartBar, IconEdit, IconRefresh } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard, DifficultyLevel } from '../../types';

const DIFFICULTY_COLORS = {
  [DifficultyLevel.EASY]: 'green',
  [DifficultyLevel.MEDIUM]: 'yellow',
  [DifficultyLevel.HARD]: 'red',
};

interface FlashcardGridProps {
  flashcards: Flashcard[];
  onEdit: (flashcard: Flashcard) => void;
}

export const FlashcardGrid = React.memo(function FlashcardGrid({
  flashcards,
  onEdit,
}: FlashcardGridProps) {
  const [flippedCards, setFlippedCards] = useState<{ [id: string]: boolean }>({});

  const handleFlip = useCallback((id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleEdit = useCallback(
    (card: Flashcard) => {
      onEdit(card);
    },
    [onEdit]
  );

  const cardVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const renderFlashcard = (card: Flashcard) => {
    const { id, question, answer, difficulty, success_rate, times_used } = card;
    const isFlipped = flippedCards[id] === true;

    const successRatePercentage = (success_rate * 100).toFixed(1);
    const progressColor =
      success_rate > 0.7 ? 'green' : success_rate > 0.4 ? 'yellow' : 'red';

    return (
      <Grid.Col key={id} span={{ base: 12, sm: 6, md: 4 }}>
        <Box
          style={{
            perspective: '1000px',
            width: '100%',
            height: '400px',
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
            <motion.div
              key={`${id}-front`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                backfaceVisibility: 'hidden',
                borderRadius: rem(8),
                overflow: 'hidden',
              }}
            >
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ height: '100%', boxSizing: 'border-box' }}
              >
                <Stack gap="md" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <Badge color={DIFFICULTY_COLORS[difficulty]}>
                      {difficulty}
                    </Badge>
                    <ActionIcon variant="light" onClick={() => handleEdit(card)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>

                  <Stack justify="center" style={{ flex: 1 }}>
                    <Text size="lg" fw={700} ta="center" lineClamp={3}>
                      {question}
                    </Text>
                  </Stack>

                  <Tooltip label="Success Rate" position="bottom">
                    <Group gap="xs">
                      <IconChartBar size={16} />
                      <Text size="sm">{successRatePercentage}%</Text>
                      <Progress
                        value={Number(successRatePercentage)}
                        color={progressColor}
                        size="sm"
                        style={{ flex: 1 }}
                      />
                    </Group>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    Used {times_used} times
                  </Text>

                  <ActionIcon
                    variant="default"
                    onClick={() => handleFlip(id)}
                    style={{ marginTop: 'auto' }}
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Stack>
              </Card>
            </motion.div>

            <motion.div
              key={`${id}-back`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderRadius: rem(8),
                overflow: 'hidden',
              }}
            >
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  height: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: '#fffbee',
                }}
              >
                <Stack gap="md" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <Badge color={DIFFICULTY_COLORS[difficulty]}>
                      {difficulty}
                    </Badge>
                    <ActionIcon variant="light" onClick={() => handleEdit(card)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>

                  <Stack justify="center" style={{ flex: 1 }}>
                    <Text size="lg" fw={700} ta="center" lineClamp={6}>
                      {answer}
                    </Text>
                  </Stack>

                  <ActionIcon
                    variant="default"
                    onClick={() => handleFlip(id)}
                    style={{ marginTop: 'auto' }}
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Stack>
              </Card>
            </motion.div>
          </motion.div>
        </Box>
      </Grid.Col>
    );
  };

  const renderedCards = useMemo(
    () => flashcards.map(renderFlashcard),
    [flashcards, flippedCards, renderFlashcard]
  );

  return <Grid>{renderedCards}</Grid>;
});
