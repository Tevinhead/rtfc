import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  rem,
} from '@mantine/core';
import { motion } from 'framer-motion';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { DifficultyLevel, Flashcard } from '../../types';
import { useFlashcardStore } from '../../stores/flashcardStore';

interface FlashcardEditorProps {
  packId: string;
  flashcard?: Flashcard;
  onClose: () => void;
}

export function FlashcardEditor({
  packId,
  flashcard,
  onClose,
}: FlashcardEditorProps) {
  const { addFlashcard, updateFlashcard, loading, error } = useFlashcardStore();

  const [question, setQuestion] = useState<string>(flashcard?.question || '');
  const [answer, setAnswer] = useState<string>(flashcard?.answer || '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    flashcard?.difficulty || DifficultyLevel.MEDIUM
  );

  const handleSave = useCallback(async () => {
    if (!question.trim() || !answer.trim()) {
      return;
    }

    const payload = {
      question,
      answer,
      pack_id: packId,
      difficulty,
    };

    try {
      if (flashcard?.id) {
        await updateFlashcard(flashcard.id, payload);
      } else {
        await addFlashcard(payload);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save flashcard:', err);
    }
  }, [question, answer, difficulty, packId, flashcard, onClose, addFlashcard, updateFlashcard]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="lg">
          <Box>
            <Text fw={500} size="sm" mb="xs">
              Question
            </Text>
            <Textarea
              placeholder="Type the question here..."
              minRows={6}
              autosize
              styles={{
                input: {
                  fontSize: rem(14),
                  lineHeight: 1.5,
                },
              }}
              value={question}
              onChange={(e) => setQuestion(e.currentTarget.value)}
            />
          </Box>

          <Box>
            <Text fw={500} size="sm" mb="xs">
              Answer
            </Text>
            <Textarea
              placeholder="Type the answer here..."
              minRows={6}
              autosize
              styles={{
                input: {
                  fontSize: rem(14),
                  lineHeight: 1.5,
                },
              }}
              value={answer}
              onChange={(e) => setAnswer(e.currentTarget.value)}
            />
          </Box>

          <Select
            label="Difficulty"
            value={difficulty}
            onChange={(val) => {
              if (val) {
                setDifficulty(val as DifficultyLevel);
              }
            }}
            data={[
              { value: DifficultyLevel.EASY, label: 'Easy' },
              { value: DifficultyLevel.MEDIUM, label: 'Medium' },
              { value: DifficultyLevel.HARD, label: 'Hard' },
            ]}
          />

          {error && (
            <Text color="red" size="sm">
              {error}
            </Text>
          )}

          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              color="gray"
              onClick={onClose}
              leftSection={<IconX size={16} />}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              leftSection={<IconDeviceFloppy size={16} />}
            >
              Save Flashcard
            </Button>
          </Group>
        </Stack>
      </Paper>
    </motion.div>
  );
}
