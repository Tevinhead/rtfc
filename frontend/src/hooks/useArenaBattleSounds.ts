import { useEffect } from 'react';
import { ArenaStep } from '../types/arena';
import { useSound } from './useSound';

export const useArenaBattleSounds = (step: ArenaStep) => {
  const {
    playBattleSound,
    stopBattleSound,
    playVsSound,
    playResultSound,
  } = useSound();

  useEffect(() => {
    switch (step) {
      case ArenaStep.VERSUS:
        stopBattleSound();
        playVsSound();
        break;
      case ArenaStep.BATTLE:
        playBattleSound();
        break;
      case ArenaStep.FINAL_RESULT:
        stopBattleSound();
        playResultSound();
        break;
      default:
        stopBattleSound();
        break;
    }
    return () => {
      stopBattleSound();
    };
  }, [step, playBattleSound, stopBattleSound, playVsSound, playResultSound]);
};