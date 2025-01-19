import { useEffect, useRef, useCallback } from 'react';

// Sound files are in public/sounds
const battleSoundURL = '/sounds/battle-sound.mp3';
const vsScreenSoundURL = '/sounds/vs-screen-sound.mp3';
const resultScreenSoundURL = '/sounds/result-screen-sound.mp3';
const roundResultSoundURL = '/sounds/round-result-sound.mp3';

/**
 * This hook manages playing/stopping background and one-shot sounds.
 */
export const useSound = () => {
  // Keep refs for audio that needs to be stopped
  const battleAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the battle-sound Audio object once
  useEffect(() => {
    const audio = new Audio(battleSoundURL);
    audio.loop = true;
    audio.volume = 0.3; // 30% volume
    battleAudioRef.current = audio;

    // Cleanup: stop if unmounted
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  /**
   * Start the battle-sound loop (if not already playing).
   */
  const playBattleSound = useCallback(() => {
    if (battleAudioRef.current) {
      battleAudioRef.current.currentTime = 0; // optional, restart from beginning
      battleAudioRef.current.play().catch((err) => {
        console.error('Failed to play battle-sound:', err);
      });
    }
  }, []);

  /**
   * Stop the battle-sound loop.
   */
  const stopBattleSound = useCallback(() => {
    if (battleAudioRef.current) {
      battleAudioRef.current.pause();
      battleAudioRef.current.currentTime = 0;
    }
  }, []);

  /**
   * Play the "vs" screen sound once (80% volume).
   */
  const playVsSound = useCallback(() => {
    const audio = new Audio(vsScreenSoundURL);
    audio.volume = 0.8;
    audio.play().catch((err) => {
      console.error('Failed to play vs-screen-sound:', err);
    });
  }, []);

  /**
   * Play the final "result" screen sound once (70% volume).
   */
  const playResultSound = useCallback(() => {
    const audio = new Audio(resultScreenSoundURL);
    audio.volume = 0.35;
    resultAudioRef.current = audio;
    audio.play().catch((err) => {
      console.error('Failed to play result-screen-sound:', err);
    });
  }, []);

  /**
   * Stop the result sound.
   */
  const stopResultSound = useCallback(() => {
    if (resultAudioRef.current) {
      resultAudioRef.current.pause();
      resultAudioRef.current.currentTime = 0;
    }
  }, []);

  /**
   * Play the round result screen sound once (100% volume).
   */
  const playRoundResultSound = useCallback(() => {
    const audio = new Audio(roundResultSoundURL);
    audio.volume = 1.0;
    audio.play().catch((err) => {
      console.error('Failed to play round-result-sound:', err);
    });
  }, []);

  /**
   * Keep the existing playSound function for backward compatibility
   */
  const playSound = useCallback((effect: string) => {
    // No-op for now, can be expanded later if needed
  }, []);

  return {
    playBattleSound,
    stopBattleSound,
    playVsSound,
    playResultSound,
    stopResultSound,
    playRoundResultSound,
    playSound, // Keep existing usage safe
  };
};
