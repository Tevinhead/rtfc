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
    handleNextRound,
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
        onNextRound={handleNextRound}
        onReset={resetBattle}
        isLoading={battleLoading}
      />
    );
  };

  return (
    <Box
      pos="relative"
      p={{ base: 'md', sm: 'lg', md: 'xl' }}
      style={{
        height: '100vh',
        background: 'linear-gradient(165deg, #1A1B1E 0%, #13151A 100%)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ blur: 2 }}
      />
      <Center style={{ flex: 1, width: '100%' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={arenaStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{
              height: '100%',
              width: '100%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </Center>
    </Box>
  );
}
