import React, { useEffect, useState } from 'react';
import { Box, Center, Card, Title, Stack, LoadingOverlay } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';

import { useStudentStore } from '../stores';
import { useFlashcardStore } from '../stores/flashcardStore';
import { usePackStore } from '../stores/packStore';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { ArenaSetup } from '../components/arena/ArenaSetup';
import { ArenaBattle } from '../components/arena/ArenaBattle';
import { useArenaBattle } from '../hooks/useArenaBattle';
import { ArenaStep } from '../types/arena';

export function ArenaPage() {
  const { students, fetchStudents, error: studentsError } = useStudentStore();
  const { getByPack, error: flashcardsError } = useFlashcardStore();
  const { fetchPacks, error: packsError } = usePackStore();
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    currentFlashcard,
    arenaStep,
    isLoading: battleLoading,
    currentArenaSession,
    currentArenaMatch,
    startBattle,
    handleVersusReady,
    handleSelectWinner,
    resetBattle
  } = useArenaBattle();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchStudents(), fetchPacks()]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [fetchStudents, fetchPacks, retryCount]);

  const handleStartArena = async (packId: string, playerIds: string[], rounds: number) => {
    setIsLoading(true);
    try {
      await getByPack(packId);
      await startBattle(playerIds, rounds);
    } catch (error) {
      console.error('Failed to start arena:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Error handling
  const error = studentsError || flashcardsError || packsError;
  if (error) {
    return (
      <Center style={{ minHeight: '50vh' }}>
        <ErrorAlert 
          error={error} 
          onRetry={handleRetry}
        />
      </Center>
    );
  }

  const renderContent = () => {
    if (arenaStep === ArenaStep.SETUP) {
      return (
        <ArenaSetup 
          onStart={handleStartArena}
          isLoading={isLoading || battleLoading}
        />
      );
    }

    return (
      <ArenaBattle
        step={arenaStep}
        currentFlashcard={currentFlashcard}
        currentMatch={currentArenaMatch}
        arenaSession={currentArenaSession}
        students={students}
        onVersusReady={handleVersusReady}
        onSelectWinner={handleSelectWinner}
        onReset={resetBattle}
        isLoading={battleLoading}
      />
    );
  };

  return (
    <Box
      pos="relative"
      style={{
        minHeight: '70vh',
        background: 'linear-gradient(165deg, #1A1B1E 0%, #13151A 100%)',
        padding: '2rem'
      }}
    >
      <LoadingOverlay 
        visible={isLoading} 
        zIndex={1000}
        overlayProps={{ blur: 2 }}
      />
      <Center py="xl">
        <Card
          w="90%"
          maw={1200}
          styles={(theme) => ({
            root: {
              background: `linear-gradient(165deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[9]} 100%)`,
              border: `1px solid rgba(149, 97, 255, 0.2)`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
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
          <Stack>
            <Title
              order={2}
              ta="center"
              mt="sm"
              styles={(theme) => ({
                root: {
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  background: `linear-gradient(45deg, ${theme.colors.violet[4]}, ${theme.colors.indigo[4]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }
              })}
            >
              Flashcard Arena
            </Title>
            <AnimatePresence mode="wait">
              <motion.div
                key={arenaStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </Stack>
        </Card>
      </Center>
    </Box>
  );
}
