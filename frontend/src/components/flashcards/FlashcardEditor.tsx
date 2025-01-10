import React, { useCallback } from 'react';
import {
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
  const { addFlashcard, loading, error } = useFlashcardStore();
  const [difficulty, setDifficulty] = React.useState<DifficultyLevel>(
    flashcard?.difficulty || DifficultyLevel.MEDIUM
  );

  const questionEditor = useEditor({
    extensions: [StarterKit],
    content: flashcard?.question || '<p></p>',
    editable: true,
  });

  const answerEditor = useEditor({
    extensions: [StarterKit],
    content: flashcard?.answer || '<p></p>',
    editable: true,
  });

  const handleSave = useCallback(async () => {
    if (!questionEditor || !answerEditor) return;
    const questionHTML = questionEditor.getHTML();
    const answerHTML = answerEditor.getHTML();
    
    if (!questionHTML.trim() || !answerHTML.trim()) {
      return;
    }

    await addFlashcard({
      question: questionHTML,
      answer: answerHTML,
      pack_id: packId,
      difficulty: difficulty
    });
    onClose();
  }, [questionEditor, answerEditor, addFlashcard, packId, difficulty, onClose]);

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
            <RichTextEditor editor={questionEditor}>
              <RichTextEditor.Toolbar>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content 
                style={{
                  minHeight: '200px',
                  backgroundColor: 'white'
                }}
              />
            </RichTextEditor>
          </Box>

          <Box>
            <Text fw={500} size="sm" mb="xs">
              Answer
            </Text>
            <RichTextEditor editor={answerEditor}>
              <RichTextEditor.Toolbar>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content 
                style={{
                  minHeight: '200px',
                  backgroundColor: 'white'
                }}
              />
            </RichTextEditor>
          </Box>

          <Select
            label="Difficulty"
            value={difficulty}
            onChange={(val) => {
              if (val) setDifficulty(val as DifficultyLevel);
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
