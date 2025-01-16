import React, { useCallback, useState, useEffect } from 'react';
import {
  Stack,
  Select,
  NumberInput,
  Button,
  Text,
  SimpleGrid,
  Card,
  Avatar,
  Group,
  Badge,
  Box,
  Alert,
  Paper,
  MantineTheme,
  useMantineTheme,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useArenaSetup } from '../../hooks/useArenaSetup';
import { useStudentStore } from '../../stores';
import { Student } from '../../types';

interface ArenaSetupProps {
  onStart: (packId: string, playerIds: string[], rounds: number) => void;
  isLoading?: boolean;
}

export const ArenaSetup: React.FC<ArenaSetupProps> = ({ onStart, isLoading = false }) => {
  const theme = useMantineTheme();
  const {
    selectedPackId,
    numRounds,
    validationErrors,
    packSelectData,
    handlePackChange,
    handleRoundsChange,
    getSetupData,
  } = useArenaSetup();

  const { students, fetchStudents } = useStudentStore();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const toggleStudent = useCallback(
    (id: string) => {
      setSelectedPlayerIds((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
    },
    [setSelectedPlayerIds]
  );

  const handleStartClick = () => {
    const data = getSetupData();
    if (!data.selectedPackId) {
      return;
    }
    if (selectedPlayerIds.length < 2) {
      window.alert('Please select at least 2 players for the Arena.');
      return;
    }
    if (numRounds < 1 || numRounds > 20) {
      window.alert('Rounds must be between 1 and 20');
      return;
    }

    onStart(data.selectedPackId, selectedPlayerIds, numRounds);
  };

  return (
    <Stack
      gap="xl"
      data-testid="arena-setup"
      p="xl"
      styles={(theme: MantineTheme) => ({
        root: {
          borderRadius: theme.radius.xl,
          background: `linear-gradient(165deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[9]} 100%)`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2)`,
          border: `1px solid ${theme.colors.dark[4]}`,
          position: 'relative',
          overflow: 'hidden'
        }
      })}
    >
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top left, rgba(95, 75, 255, 0.15), transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <Stack align="center" mb="xl">
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
      </Stack>

      <Paper
        p="xl"
        radius="md"
        styles={(theme: MantineTheme) => ({
          root: {
            background: `linear-gradient(165deg, rgba(25, 26, 30, 0.8) 0%, rgba(15, 16, 20, 0.9) 100%)`,
            backdropFilter: 'blur(16px)',
            border: `1px solid rgba(149, 97, 255, 0.2)`,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(120, 100, 255, 0.1), transparent 70%)',
              pointerEvents: 'none'
            }
          }
        })}
      >
        <Stack gap="xl">
          <Select
            label="Select a Flashcard Pack"
            placeholder="Choose your battle deck"
            data={packSelectData}
            value={selectedPackId}
            onChange={handlePackChange}
            error={validationErrors.pack}
            required
            size="lg"
            styles={(theme: MantineTheme) => ({
              label: {
                color: theme.white,
                fontSize: theme.fontSizes.lg,
                fontWeight: 600,
                marginBottom: theme.spacing.xs
              },
              input: {
                fontSize: theme.fontSizes.md,
                background: theme.colors.dark[7],
                border: `1px solid ${theme.colors.dark[4]}`,
                color: theme.white,
                '&:focus': {
                  borderColor: theme.colors.violet[5]
                }
              },
              item: {
                '&[data-selected]': {
                  '&, &:hover': {
                    backgroundColor: theme.colors.violet[9],
                    color: theme.white
                  }
                }
              }
            })}
          />

          <NumberInput
            label="Number of Rounds"
            description="Choose how many rounds of battle (1-20)"
            min={1}
            max={20}
            value={numRounds}
            onChange={handleRoundsChange}
            error={validationErrors.rounds}
            required
            size="lg"
            styles={(theme: MantineTheme) => ({
              label: {
                color: theme.white,
                fontSize: theme.fontSizes.lg,
                fontWeight: 600,
                marginBottom: theme.spacing.xs
              },
              input: {
                fontSize: theme.fontSizes.md,
                background: theme.colors.dark[7],
                border: `1px solid ${theme.colors.dark[4]}`,
                color: theme.white,
                '&:focus': {
                  borderColor: theme.colors.violet[5]
                }
              }
            })}
          />

          <Box mt="xl">
            <Text
              fw={700}
              mb="md"
              size="lg"
              variant="gradient"
              gradient={{ from: 'violet', to: 'indigo', deg: 45 }}
            >
              Select Players (at least 2)
            </Text>
            {students.length === 0 ? (
              <Alert icon={<IconAlertCircle size={16} />} color="yellow">
                No students found. Please add some students first.
              </Alert>
            ) : (
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3 }}
                spacing={{ base: 'sm', sm: 'md', md: 'lg' }}
                mt="lg"
              >
                {students.map((student: Student) => {
                  const isSelected = selectedPlayerIds.includes(student.id);
                  return (
                    <Card
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      shadow={isSelected ? 'lg' : 'md'}
                      withBorder
                      p="lg"
                      style={{
                        cursor: 'pointer',
                        transform: isSelected ? 'translateY(-4px)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                      styles={(theme: MantineTheme) => ({
                        root: {
                          backgroundColor: isSelected ? theme.colors.dark[6] : theme.colors.dark[7],
                          borderColor: isSelected ? theme.colors.violet[5] : theme.colors.dark[4],
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows.lg
                          }
                        }
                      })}
                    >
                      <Group>
                        <Avatar
                          radius="xl"
                          size={50}
                          src={student.avatar_url}
                          alt={student.name}
                        >
                          {(!student.avatar_url && student.name) ? student.name.charAt(0) : ''}
                        </Avatar>
                        <Stack gap="xs">
                          <Text size="lg" fw={700} c="white">{student.name}</Text>
                          <Badge
                            size="lg"
                            variant="gradient"
                            gradient={{ from: 'violet', to: 'indigo', deg: 45 }}
                          >
                            ELO: {student.elo_rating}
                          </Badge>
                        </Stack>
                      </Group>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </Box>
        </Stack>
      </Paper>

      <Button
        onClick={handleStartClick}
        variant="gradient"
        gradient={{ from: 'violet', to: 'indigo', deg: 45 }}
        loading={isLoading}
        size="xl"
        fullWidth
        mt="xl"
        styles={(theme: MantineTheme) => ({
          root: {
            height: 56,
            fontSize: theme.fontSizes.lg,
            fontWeight: 700,
            boxShadow: theme.shadows.md,
            '&:hover': {
              boxShadow: theme.shadows.lg
            }
          }
        })}
        data-testid="start-arena-button"
      >
        Start Arena Battle
      </Button>
    </Stack>
  );
};
