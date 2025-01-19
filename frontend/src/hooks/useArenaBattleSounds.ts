import { useEffect } from 'react';
import { ArenaStep } from '../types/arena';
import { useSound } from './useSound';

export const useArenaBattleSounds = (step: ArenaStep) => {
  const {
    playBattleSound,
    stopBattleSound,
    playVsSound,
    playResultSound,
    stopResultSound,
    playRoundResultSound,
  } = useSound();

  useEffect(() => {
    switch (step) {
      case ArenaStep.VERSUS:
        stopBattleSound();
        stopResultSound();
        playVsSound();
        break;
      case ArenaStep.BATTLE:
        stopResultSound();
        playBattleSound();
        break;
      case ArenaStep.ROUND_RESULT:
        stopBattleSound();
        stopResultSound();
        playRoundResultSound();
        break;
      case ArenaStep.FINAL_RESULT:
        stopBattleSound();
        playResultSound();
        break;
      default:
        stopBattleSound();
        stopResultSound();
        break;
    }
    return () => {
      stopBattleSound();
      stopResultSound();
    };
  }, [step, playBattleSound, stopBattleSound, playVsSound, playResultSound]);
};