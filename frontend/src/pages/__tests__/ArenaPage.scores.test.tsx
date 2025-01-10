import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArenaPage } from '../ArenaPage';
import { useStudentStore } from '../../stores';
import { useArenaBattle } from '../../hooks/useArenaBattle';
import { ArenaStep } from '../../types/arena';
import { 
  Student, 
  ArenaMatch, 
  ArenaSession,
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

jest.mock('../../hooks/useArenaBattle', () => ({
  useArenaBattle: jest.fn()
}));

describe('ArenaPage Final Results', () => {
  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Student 1',
      elo_rating: 1050,
      wins: 2,
      losses: 1,
      total_matches: 3,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      win_rate: 0.67
    },
    {
      id: '2',
      name: 'Student 2',
      elo_rating: 1150,
      wins: 1,
      losses: 2,
      total_matches: 3,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      win_rate: 0.33
    }
  ];

  const mockMatch: ArenaMatch = {
    id: '1',
    arena_id: '1',
    status: MatchStatus.COMPLETED,
    num_rounds: 3,
    rounds_completed: 3,
    player1_id: '1',
    player2_id: '2',
    player1_elo_before: 1000,
    player2_elo_before: 1200,
    player1_elo_after: 1050,
    player2_elo_after: 1150,
    winner_ids: ['1'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  const mockSession: ArenaSession = {
    id: '1',
    status: ArenaSessionStatus.COMPLETED,
    num_rounds: 3,
    rounds_completed: 3,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    participants: [
      { 
        student_id: '1', 
        name: 'Student 1', 
        elo_rating: 1050, 
        elo_change: 50, 
        wins: 2, 
        losses: 1, 
        fights_played: 3,
        elo_before: 1000,
        elo_after: 1050
      },
      { 
        student_id: '2', 
        name: 'Student 2', 
        elo_rating: 1150, 
        elo_change: -50, 
        wins: 1, 
        losses: 2, 
        fights_played: 3,
        elo_before: 1200,
        elo_after: 1150
      }
    ]
  };

  beforeEach(() => {
    mockHook(useStudentStore, {
      students: mockStudents,
      fetchStudents: jest.fn(),
      error: null
    });

    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.FINAL_RESULT,
      isLoading: false,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession,
      resetBattle: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays final results header', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/Final Results/i)).toBeInTheDocument();
  });

  it('shows all participants in final scoreboard', () => {
    render(<ArenaPage />);
    mockSession.participants?.forEach(participant => {
      expect(screen.getByText(participant.name!)).toBeInTheDocument();
    });
  });

  it('displays ELO changes for each participant', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/\+50/)).toBeInTheDocument(); // Student 1 gained 50
    expect(screen.getByText(/-50/)).toBeInTheDocument(); // Student 2 lost 50
  });

  it('shows win/loss record for each participant', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/2 wins/i)).toBeInTheDocument();
    expect(screen.getByText(/1 loss/i)).toBeInTheDocument();
    expect(screen.getByText(/1 win/i)).toBeInTheDocument();
    expect(screen.getByText(/2 losses/i)).toBeInTheDocument();
  });

  it('displays final ELO ratings', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/1050/)).toBeInTheDocument();
    expect(screen.getByText(/1150/)).toBeInTheDocument();
  });

  it('allows starting a new arena', () => {
    const mockResetBattle = jest.fn();
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.FINAL_RESULT,
      isLoading: false,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession,
      resetBattle: mockResetBattle
    });

    render(<ArenaPage />);
    
    const newArenaButton = screen.getByText(/Start New Arena/i);
    fireEvent.click(newArenaButton);

    expect(mockResetBattle).toHaveBeenCalled();
  });

  it('shows loading state when starting new arena', () => {
    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.FINAL_RESULT,
      isLoading: true,
      currentArenaMatch: mockMatch,
      currentArenaSession: mockSession
    });

    render(<ArenaPage />);
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });
});
