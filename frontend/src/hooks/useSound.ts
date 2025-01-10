import { useCallback } from 'react';

export const useSound = () => {
  // Return a no-op function since we don't have valid sound files
  const playSound = useCallback((_effect: string) => {
    // Intentionally empty - sounds disabled
  }, []);

  return { playSound };
};
