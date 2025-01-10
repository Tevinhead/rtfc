import React, { useCallback, useMemo } from 'react';
import {
  Grid,
  Card,
  Text,
  Group,
  Badge,
  ActionIcon,
  Progress,
  Tooltip,
  Stack,
  Box,
} from '@mantine/core';
import { IconChartBar, IconEdit } from '@tabler/icons-react';
import { motion } from 'framer-motion';
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

const animationProps = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  whileHover: { scale: 1.02 },
  transition: { duration: 0.2 },
};

export const FlashcardGrid = React.memo(function FlashcardGrid({ flashcards, onEdit }: FlashcardGridProps) {
  const handleEdit = useCallback((card: Flashcard) => {
    onEdit(card);
  }, [onEdit]);

  const renderCard = useCallback((card: Flashcard) => {
    const successRate = (card.success_rate * 100).toFixed(1);
    const progressColor = card.success_rate > 0.7 ? 'green' : card.success_rate > 0.4 ? 'yellow' : 'red';

    return (
      <Grid.Col key={card.id} span={{ base: 12, sm: 6, md: 4 }}>
        <motion.div {...animationProps}>
          <Card shadow="sm" padding="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Badge color={DIFFICULTY_COLORS[card.difficulty]}>
                  {card.difficulty}
                </Badge>
                <ActionIcon
                  variant="light"
                  onClick={() => handleEdit(card)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Group>

              <Text fw={500} size="lg" lineClamp={2}>
                {card.question}
              </Text>
              <Text c="dimmed" size="sm" lineClamp={3}>
                {card.answer}
              </Text>

              <Box>
                <Tooltip label="Success Rate">
                  <Group gap="xs">
                    <IconChartBar size={16} />
                    <Text size="sm">{successRate}%</Text>
                  </Group>
                </Tooltip>
                <Progress
                  value={card.success_rate * 100}
                  color={progressColor}
                  size="sm"
                  mt={4}
                />
              </Box>

              <Text size="xs" c="dimmed">
                Used {card.times_used} times
              </Text>
            </Stack>
          </Card>
        </motion.div>
      </Grid.Col>
    );
  }, [handleEdit]);

  const renderedCards = useMemo(() => 
    flashcards.map(renderCard),
    [flashcards, renderCard]
  );

  return (
    <Grid>
      {renderedCards}
    </Grid>
  );
});
