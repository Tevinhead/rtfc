import { useState, useMemo } from 'react';
import { useStudentStore, useFlashcardStore } from '../stores';
import { usePackStore } from '../stores/packStore';
import type { ValidationError, ArenaSetupData } from '../types/arena';

export const useArenaSetup = () => {
  const { students } = useStudentStore();
  const { packs } = usePackStore();

  // Setup state
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [numRounds, setNumRounds] = useState(3);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError>({});

  // Computed values
  const studentSelectData = useMemo(() => {
    return students.map((s) => ({
      value: s.id,
      label: `${s.name} (ELO: ${s.elo_rating})`,
    }));
  }, [students]);

  const packSelectData = useMemo(() => {
    return packs.map((p) => ({
      value: p.id,
      label: p.name || 'Untitled Pack',
    }));
  }, [packs]);

  const validateSetup = (): boolean => {
    const errors: ValidationError = {};

    if (!selectedPackId) {
      errors.pack = 'Please select a flashcard pack';
    }

    if (selectedPlayerIds.length < 2) {
      errors.players = 'Please select at least 2 players';
    }

    if (numRounds < 1 || numRounds > 20) {
      errors.rounds = 'Number of rounds must be between 1 and 20';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { getByPack } = useFlashcardStore();

  const handlePackChange = async (value: string | null) => {
    const packId = value || '';
    setSelectedPackId(packId);
    setValidationErrors({});
    
    if (packId) {
      await getByPack(packId);
    }
  };

  const handleRoundsChange = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    setNumRounds(Number.isFinite(numValue) ? numValue : 1);
    setValidationErrors({});
  };

  const handlePlayersChange = (value: string[]) => {
    setSelectedPlayerIds(value);
    setValidationErrors({});
  };

  const getSetupData = (): ArenaSetupData => ({
    selectedPackId,
    numRounds,
    selectedPlayerIds
  });

  const resetSetup = () => {
    setSelectedPackId('');
    setSelectedPlayerIds([]);
    setNumRounds(3);
    setValidationErrors({});
  };

  return {
    // State
    selectedPackId,
    numRounds,
    selectedPlayerIds,
    validationErrors,
    
    // Computed
    studentSelectData,
    packSelectData,
    
    // Methods
    validateSetup,
    handlePackChange,
    handleRoundsChange,
    handlePlayersChange,
    getSetupData,
    resetSetup
  };
};
