import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ArenaPage } from '../ArenaPage';
import { useStudentStore } from '../../stores';
import { useFlashcardStore } from '../../stores/flashcardStore';
import { usePackStore } from '../../stores/packStore';
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

expect.extend(toHaveNoViolations);

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

jest.mock('../../stores/packStore', () => ({
  usePackStore: jest.fn()
}));

jest.mock('../../hooks/useArenaBattle', () => ({
  useArenaBattle: jest.fn()
}));

describe('ArenaPage Accessibility', () => {
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

    mockHook(usePackStore, {
      packs: [
        { id: '1', name: 'Pack 1', description: 'Test Pack 1' }
      ],
      fetchPacks: jest.fn(),
      error: null
    });
  });

  it('setup step has no accessibility violations', async () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.SETUP,
      isLoading: false
    });

    const { container } = render(<ArenaPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('versus step has no accessibility violations', async () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.VERSUS,
      isLoading: false,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession
    });

    const { container } = render(<ArenaPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('battle step has no accessibility violations', async () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.BATTLE,
      isLoading: false,
      currentFlashcard: mockFlashcard,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession
    });

    const { container } = render(<ArenaPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('final results step has no accessibility violations', async () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.FINAL_RESULT,
      isLoading: false,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession
    });

    const { container } = render(<ArenaPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper heading structure', () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.SETUP,
      isLoading: false
    });

    render(<ArenaPage />);
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toHaveAttribute('aria-level', '1');
  });

  it('form controls have associated labels', () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.SETUP,
      isLoading: false
    });

    render(<ArenaPage />);
    const inputs = screen.getAllByRole('spinbutton');
    inputs.forEach(input => {
      expect(input).toHaveAccessibleName();
    });
  });

  it('buttons have descriptive text', () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.SETUP,
      isLoading: false
    });

    render(<ArenaPage />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });

  it('loading states are announced to screen readers', () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.SETUP,
      isLoading: true
    });

    render(<ArenaPage />);
    expect(screen.getByRole('alert')).toHaveTextContent(/loading/i);
  });

  it('error messages are announced to screen readers', () => {
    mockHook(useStudentStore, {
      students: [],
      fetchStudents: jest.fn(),
      error: 'Test error message'
    });

    render(<ArenaPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
  });
});
