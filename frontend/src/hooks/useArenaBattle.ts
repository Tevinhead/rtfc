import { useState } from 'react';
import { useBattleStore } from '../stores';
import { useFlashcardStore } from '../stores/flashcardStore';
import type { Flashcard } from '../types';
import { ArenaStep } from '../types/arena';

export const useArenaBattle = () => {
  const { flashcards } = useFlashcardStore();
  const { 
    currentArenaSession,
    currentArenaMatch,
    createArenaSession,
    getNextArenaMatch,
    setArenaMatchWinner,
    getArenaResults
  } = useBattleStore();

  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [arenaStep, setArenaStep] = useState<ArenaStep>(ArenaStep.SETUP);
  const [isLoading, setIsLoading] = useState(false);

  const getRandomFlashcard = (): Flashcard | null => {
    if (!flashcards || flashcards.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    return flashcards[randomIndex];
  };

  const startBattle = async (playerIds: string[], rounds: number) => {
    setIsLoading(true);
    try {
      // Create arena session with selected players
      await createArenaSession(playerIds, rounds);

      // Get first match
      await getNextArenaMatch();

      // Set random flashcard
      const flashcard = getRandomFlashcard();
      if (!flashcard) throw new Error('No flashcards available');
      setCurrentFlashcard(flashcard);

      // Move to VS screen
      setArenaStep(ArenaStep.VERSUS);
    } catch (error) {
      console.error('Failed to start battle:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersusReady = () => {
    setArenaStep(ArenaStep.BATTLE);
  };

  const handleSelectWinner = async (winnerIds: string[]) => {
    if (isLoading) return; // Prevent double submission
    setIsLoading(true);
    try {
      const result = await setArenaMatchWinner(winnerIds);
      const { arena_session: updatedSession } = result;

      // If session is completed or all rounds are done, get final results
      if (updatedSession.status === 'completed' || 
          updatedSession.rounds_completed === updatedSession.num_rounds) {
        await getArenaResults();
        setArenaStep(ArenaStep.FINAL_RESULT);
        return;
      }

      // Otherwise, get next match and continue
      await getNextArenaMatch();
      const flashcard = getRandomFlashcard();
      if (!flashcard) {
        console.error('No flashcards available');
        return;
      }
      setCurrentFlashcard(flashcard);
      setArenaStep(ArenaStep.VERSUS);
    } catch (error) {
      console.error('Failed to process winner:', error);
      // Don't throw, just log the error and return
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const resetBattle = () => {
    setArenaStep(ArenaStep.SETUP);
    setCurrentFlashcard(null);
  };

  return {
    // State
    currentFlashcard,
    arenaStep,
    isLoading,
    currentArenaSession,
    currentArenaMatch,

    // Methods
    startBattle,
    handleVersusReady,
    handleSelectWinner,
    resetBattle,
    setArenaStep
  };
};
