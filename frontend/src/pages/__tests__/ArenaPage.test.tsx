import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ArenaPage } from '../ArenaPage';
import { useStudentStore } from '../../stores';
import { useFlashcardStore } from '../../stores/flashcardStore';
import { usePackStore } from '../../stores/packStore';
import { useArenaBattle } from '../../hooks/useArenaBattle';
import { ArenaStep } from '../../types/arena';

// Helper to type-safely mock a hook
const mockHook = <T extends object>(hook: unknown, defaultValue: T) => {
  return (hook as jest.Mock<T>).mockReturnValue(defaultValue);
};

// Mock the stores and hooks
jest.mock('../../stores', () => ({
  useStudentStore: jest.fn()
}));

jest.mock('../../stores/flashcardStore', () => ({
  useFlashcardStore: jest.fn()
}));

jest.mock('../../stores/packStore', () => ({
  usePackStore: jest.fn()
}));

jest.mock('../../hooks/useArenaBattle', () => ({
  useArenaBattle: jest.fn()
}));

describe('ArenaPage', () => {
  // Setup default mock implementations
  beforeEach(() => {
    mockHook(useStudentStore, {
      students: [],
      fetchStudents: jest.fn(),
      error: null
    });
    
    mockHook(useFlashcardStore, {
      getByPack: jest.fn(),
      error: null
    });
    
    mockHook(usePackStore, {
      fetchPacks: jest.fn(),
      error: null
    });
    
    mockHook(useArenaBattle, {
      currentFlashcard: null,
      arenaStep: ArenaStep.SETUP,
      isLoading: false,
      currentArenaSession: null,
      currentArenaMatch: null,
      startBattle: jest.fn(),
      handleVersusReady: jest.fn(),
      handleSelectWinner: jest.fn(),
      resetBattle: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads initial data on mount', () => {
    const mockFetchStudents = jest.fn();
    const mockFetchPacks = jest.fn();
    
    mockHook(useStudentStore, {
      students: [],
      fetchStudents: mockFetchStudents,
      error: null
    });
    
    mockHook(usePackStore, {
      fetchPacks: mockFetchPacks,
      error: null
    });

    render(<ArenaPage />);

    expect(mockFetchStudents).toHaveBeenCalled();
    expect(mockFetchPacks).toHaveBeenCalled();
  });

  it('shows error alert when there is an error', () => {
    const testError = 'Test error message';
    mockHook(useStudentStore, {
      students: [],
      fetchStudents: jest.fn(),
      error: testError
    });

    render(<ArenaPage />);
    expect(screen.getByText(testError)).toBeInTheDocument();
  });

  it('shows ArenaSetup component in setup step', () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.SETUP,
      isLoading: false
    });

    render(<ArenaPage />);
    expect(screen.getByTestId('arena-setup')).toBeInTheDocument();
  });

  it('shows ArenaBattle component after setup', () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.VERSUS,
      isLoading: false,
      currentArenaMatch: { id: '1' },
      currentArenaSession: { id: '1' }
    });

    render(<ArenaPage />);
    expect(screen.getByTestId('arena-battle')).toBeInTheDocument();
  });

  it('handles start arena action', async () => {
    const mockGetByPack = jest.fn();
    const mockStartBattle = jest.fn();
    
    mockHook(useFlashcardStore, {
      getByPack: mockGetByPack,
      error: null
    });
    
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.SETUP,
      startBattle: mockStartBattle,
      isLoading: false
    });

    render(<ArenaPage />);

    // Simulate starting an arena
    const startButton = screen.getByTestId('start-arena-button');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockGetByPack).toHaveBeenCalled();
      expect(mockStartBattle).toHaveBeenCalled();
    });
  });
});
