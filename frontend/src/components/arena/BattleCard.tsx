import React from 'react';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  Text,
  Stack,
  Button,
  Group,
  Progress,
  Badge,
  useMantineTheme,
  Box,
  Checkbox,
  TextInput,
} from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';
import { Flashcard, RoundParticipant } from '../../types';
import { useSound } from '../../hooks/useSound';

interface BattleCardProps {
  flashcard: Flashcard;
  participants: RoundParticipant[];
  currentRound: number;
  totalRounds: number;
  onSubmitAnswer: (playerId: string, answer: string) => void;
  onSelectWinners: (winnerIds: string[]) => void;
}

export const BattleCard: React.FC<BattleCardProps> = ({
  flashcard,
  participants,
  currentRound,
  totalRounds,
  onSubmitAnswer,
  onSelectWinners,
}) => {
  const theme = useMantineTheme();
  const { playSound } = useSound();

  // Card flip states
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [selectedWinners, setSelectedWinners] = React.useState<string[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  // Reset states when flashcard changes
  React.useEffect(() => {
    setIsFlipped(false);
    setSelectedWinners([]);
    setAnswers({});
  }, [flashcard]);

  // Force re-render of card content when flashcard changes
  const cardKey = React.useMemo(() => 
    `card-${flashcard.id}-${isFlipped ? 'back' : 'front'}`, 
    [flashcard.id, isFlipped]
  );

  // Handle answer submission for a participant
  const handleAnswerSubmit = (playerId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [playerId]: answer }));
    onSubmitAnswer(playerId, answer);
  };

  // Handle winner selection
  const handleWinnerToggle = (playerId: string) => {
    setSelectedWinners(prev => {
      const isSelected = prev.includes(playerId);
      if (isSelected) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  // Submit winners
  const handleSubmitWinners = React.useCallback(() => {
    if (selectedWinners.length > 0) {
      playSound('correct');
      onSelectWinners(selectedWinners);
    }
  }, [selectedWinners, playSound, onSelectWinners]);

  // Flip the card to show/hide answer
  const handleFlip = React.useCallback(() => {
    playSound('flip');
    setIsFlipped((prev) => !prev);
  }, [playSound]);

  // Sanitize HTML content
  const sanitizedQuestion = React.useMemo(() => {
    try {
      const sanitized = DOMPurify.sanitize(flashcard.question || '');
      return sanitized || '<p>No question available</p>';
    } catch (error) {
      console.error('Error sanitizing question:', error);
      return '<p>Error displaying question</p>';
    }
  }, [flashcard.question]);

  const sanitizedAnswer = React.useMemo(() => {
    try {
      const sanitized = DOMPurify.sanitize(flashcard.answer || '');
      return sanitized || '<p>No answer available</p>';
    } catch (error) {
      console.error('Error sanitizing answer:', error);
      return '<p>Error displaying answer</p>';
    }
  }, [flashcard.answer]);

  // Difficulty color
  const difficultyColor =
    flashcard.difficulty === 'easy'
      ? 'green'
      : flashcard.difficulty === 'medium'
      ? 'yellow'
      : 'red';

  // Enhanced framer-motion variants for flipping
  const cardVariants = {
    hidden: {
      opacity: 0,
      rotateY: -180,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
    visible: {
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1,
        delay: 0.1,
      },
    },
    exit: {
      opacity: 0,
      rotateY: 180,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  // Variants for staggered answer section reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Progress bar animation variants
  const progressVariants = {
    initial: { scaleX: 0, originX: 0 },
    animate: { 
      scaleX: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15
      }
    }
  };

  return (
    <Stack style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }} gap="md">
      {/* Match/round overview */}
      <Card shadow="sm" p="md" radius="md" withBorder>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
        >
          <Group justify="space-between" mb="xs">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.student_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: index * 0.1,
                }}
              >
                <Group>
                  <Text fw={500}>{participant.student?.name}</Text>
                  <Badge color="blue">{participant.elo_before} ELO</Badge>
                </Group>
              </motion.div>
            ))}
          </Group>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Round {currentRound}/{totalRounds}
            </Text>
            <Badge
              color={difficultyColor}
              variant="light"
              leftSection={<IconBolt size={14} />}
            >
              {flashcard.difficulty.toUpperCase()}
            </Badge>
          </Group>
          <motion.div
            initial="initial"
            animate="animate"
            variants={progressVariants}
          >
            <Progress
              value={(currentRound / totalRounds) * 100}
              size="xl"
              radius="xl"
            />
          </motion.div>
        </motion.div>
      </Card>

      {/* The flipping card itself */}
      <Box style={{
        perspective: 1000,
        position: 'relative',
        width: '100%',
        height: '300px',
      }}>
        <AnimatePresence mode="sync" initial={false}>
          {/* FRONT SIDE (the question) */}
          {!isFlipped && (
            <motion.div
              key={`${cardKey}-front`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={cardVariants}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                backfaceVisibility: 'hidden',
                backgroundColor: theme.white,
                border: `1px solid ${theme.colors.gray[3]}`,
                borderRadius: theme.radius.md,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: theme.spacing.xl,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Text
                ta="center"
                fw={700}
                size="xl"
                mb="md"
                dangerouslySetInnerHTML={{ __html: sanitizedQuestion }}
                style={{ overflowY: 'auto', maxHeight: '180px' }}
              />
              <Button
                mt="auto"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                onClick={handleFlip}
                style={{ transform: 'translateZ(50px)' }}
              >
                Flip to See Answer
              </Button>
            </motion.div>
          )}

          {/* BACK SIDE (the answer) */}
          {isFlipped && (
            <motion.div
              key={`${cardKey}-back`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={cardVariants}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                backgroundColor: theme.white,
                border: `1px solid ${theme.colors.gray[3]}`,
                borderRadius: theme.radius.md,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: theme.spacing.xl,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Text
                ta="center"
                fw={700}
                size="xl"
                mb="md"
                dangerouslySetInnerHTML={{ __html: sanitizedAnswer }}
                style={{ overflowY: 'auto', maxHeight: '180px' }}
              />
              <Button
                mt="auto"
                variant="gradient"
                gradient={{ from: 'orange', to: 'red' }}
                onClick={handleFlip}
                style={{ transform: 'translateZ(50px)' }}
              >
                Flip Back to Question
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Answer submission */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card shadow="sm" p="md" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={500}>Submit Answers</Text>
            {participants.map((participant) => (
              <motion.div key={participant.student_id} variants={itemVariants}>
                <Group grow>
                  <TextInput
                    label={participant.student?.name}
                    placeholder="Enter answer..."
                    value={answers[participant.student_id] || ''}
                    onChange={(e) => handleAnswerSubmit(participant.student_id, e.target.value)}
                    disabled={!!participant.answer}
                  />
                  <Checkbox
                    label="Winner"
                    checked={selectedWinners.includes(participant.student_id)}
                    onChange={() => handleWinnerToggle(participant.student_id)}
                    disabled={!participant.answer}
                  />
                </Group>
              </motion.div>
            ))}
            <motion.div variants={itemVariants}>
              <Button
                color="blue"
                onClick={handleSubmitWinners}
                disabled={selectedWinners.length === 0}
              >
                Submit Winners
              </Button>
            </motion.div>
          </Stack>
        </Card>
      </motion.div>
    </Stack>
  );
};
