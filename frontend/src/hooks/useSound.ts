import { useEffect, useRef, useCallback } from 'react';

// Sound files are in public/sounds
const battleSoundURL = '/sounds/battle-sound.wav';
const vsScreenSoundURL = '/sounds/vs-screen-sound.wav';
const resultScreenSoundURL = '/sounds/result-screen-sound.wav';

/**
 * This hook manages playing/stopping background and one-shot sounds.
 */
export const useSound = () => {
  // We'll keep one "looped" audio ref for the BATTLE step
  const battleAudioRef = useRef<HTMLAudioElement | null>(null);

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
    audio.play().catch((err) => {
      console.error('Failed to play result-screen-sound:', err);
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
    playSound, // Keep existing usage safe
  };
};
