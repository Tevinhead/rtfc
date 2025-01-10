import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ArenaPage } from '../ArenaPage';
import { useStudentStore } from '../../stores';
import { useFlashcardStore } from '../../stores/flashcardStore';
import { useArenaBattle } from '../../hooks/useArenaBattle';
import { ArenaStep } from '../../types/arena';
import { 
  Student, 
  Flashcard, 
  ArenaMatch, 
  ArenaSession,
  DifficultyLevel,
  MatchStatus,
  ArenaSessionStatus
} from '../../types';

// Helper to type-safely mock a hook
const mockHook = <T extends object>(hook: unknown, defaultValue: T) => {
  return (hook as jest.Mock<T>).mockReturnValue(defaultValue);
};

jest.mock('../../stores', () => ({
  useStudentStore: jest.fn()
}));

jest.mock('../../stores/flashcardStore', () => ({
  useFlashcardStore: jest.fn()
}));

jest.mock('../../hooks/useArenaBattle', () => ({
  useArenaBattle: jest.fn()
}));

describe('ArenaPage Battle Step', () => {
  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Student 1',
      elo_rating: 1000,
      wins: 0,
      losses: 0,
      total_matches: 0,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      win_rate: 0
    },
    {
      id: '2',
      name: 'Student 2',
      elo_rating: 1200,
      wins: 0,
      losses: 0,
      total_matches: 0,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      win_rate: 0
    }
  ];

  const mockFlashcard: Flashcard = {
    id: '1',
    pack_id: '1',
    question: 'Test Question',
    answer: 'Test Answer',
    difficulty: DifficultyLevel.MEDIUM,
    times_used: 0,
    times_correct: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    success_rate: 0
  };

  const mockMatch: ArenaMatch = {
    id: '1',
    arena_id: '1',
    status: MatchStatus.IN_PROGRESS,
    num_rounds: 3,
    rounds_completed: 1,
    player1_id: '1',
    player2_id: '2',
    player1_elo_before: 1000,
    player2_elo_before: 1200,
    winner_ids: [],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  const mockSession: ArenaSession = {
    id: '1',
    status: ArenaSessionStatus.IN_PROGRESS,
    num_rounds: 3,
    rounds_completed: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    participants: [
      { student_id: '1', name: 'Student 1', elo_rating: 1000, elo_change: 0, wins: 0, losses: 0, fights_played: 1 },
      { student_id: '2', name: 'Student 2', elo_rating: 1200, elo_change: 0, wins: 0, losses: 0, fights_played: 1 }
    ]
  };

  beforeEach(() => {
    mockHook(useStudentStore, {
      students: mockStudents,
      fetchStudents: jest.fn(),
      error: null
    });

    mockHook(useFlashcardStore, {
      flashcards: [mockFlashcard],
      error: null
    });

    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.BATTLE,
      isLoading: false,
      currentFlashcard: mockFlashcard,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession,
      handleSelectWinner: jest.fn(),
      handleVersusReady: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays current flashcard during battle', () => {
    render(<ArenaPage />);
    expect(screen.getByText(mockFlashcard.question)).toBeInTheDocument();
    expect(screen.getByText(mockFlashcard.answer)).toBeInTheDocument();
  });

  it('displays current match participants', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/Student 1/)).toBeInTheDocument();
    expect(screen.getByText(/Student 2/)).toBeInTheDocument();
  });

  it('shows ELO ratings for participants', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/1000/)).toBeInTheDocument();
    expect(screen.getByText(/1200/)).toBeInTheDocument();
  });

  it('allows selecting a winner', async () => {
    const mockHandleSelectWinner = jest.fn();
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.BATTLE,
      isLoading: false,
      currentFlashcard: mockFlashcard,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession,
      handleSelectWinner: mockHandleSelectWinner
    });

    render(<ArenaPage />);
    
    const winnerButton = screen.getByTestId('select-winner-1');
    fireEvent.click(winnerButton);

    await waitFor(() => {
      expect(mockHandleSelectWinner).toHaveBeenCalledWith(['1']);
    });
  });

  it('shows loading state when selecting winner', () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.BATTLE,
      isLoading: true,
      currentFlashcard: mockFlashcard,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession
    });

    render(<ArenaPage />);
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('displays battle progress', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/Round 2 of 3/)).toBeInTheDocument();
  });

  it('shows versus screen between matches', () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.VERSUS,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession
    });

    render(<ArenaPage />);
    expect(screen.getByTestId('versus-screen')).toBeInTheDocument();
  });
});
