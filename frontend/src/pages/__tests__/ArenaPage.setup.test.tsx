import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArenaPage } from '../ArenaPage';
import { useStudentStore } from '../../stores';
import { usePackStore } from '../../stores/packStore';
import { useArenaBattle } from '../../hooks/useArenaBattle';
import { ArenaStep } from '../../types/arena';

// Helper to type-safely mock a hook
const mockHook = <T extends object>(hook: unknown, defaultValue: T) => {
  return (hook as jest.Mock<T>).mockReturnValue(defaultValue);
};

jest.mock('../../stores', () => ({
  useStudentStore: jest.fn()
}));

jest.mock('../../stores/packStore', () => ({
  usePackStore: jest.fn()
}));

jest.mock('../../hooks/useArenaBattle', () => ({
  useArenaBattle: jest.fn()
}));

describe('ArenaPage Setup Step', () => {
  beforeEach(() => {
    mockHook(useStudentStore, {
      students: [
        { id: '1', name: 'Student 1', elo_rating: 1000 },
        { id: '2', name: 'Student 2', elo_rating: 1200 }
      ],
      fetchStudents: jest.fn(),
      error: null
    });

    mockHook(usePackStore, {
      packs: [
        { id: '1', name: 'Pack 1', description: 'Test Pack 1' },
        { id: '2', name: 'Pack 2', description: 'Test Pack 2' }
      ],
      fetchPacks: jest.fn(),
      error: null
    });

    mockHook(useArenaBattle, {
      arenaStep: ArenaStep.SETUP,
      isLoading: false,
      startBattle: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays student selection in setup', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/select players/i)).toBeInTheDocument();
  });

  it('displays pack selection in setup', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/select pack/i)).toBeInTheDocument();
  });

  it('displays rounds input in setup', () => {
    render(<ArenaPage />);
    expect(screen.getByText(/number of rounds/i)).toBeInTheDocument();
  });

  it('validates minimum number of players', () => {
    render(<ArenaPage />);
    const startButton = screen.getByTestId('start-arena-button');
    fireEvent.click(startButton);
    expect(screen.getByText(/select at least 2 players/i)).toBeInTheDocument();
  });

  it('validates pack selection', () => {
    render(<ArenaPage />);
    const startButton = screen.getByTestId('start-arena-button');
    fireEvent.click(startButton);
    expect(screen.getByText(/select a pack/i)).toBeInTheDocument();
  });

  it('validates rounds input', () => {
    render(<ArenaPage />);
    const roundsInput = screen.getByLabelText(/number of rounds/i);
    fireEvent.change(roundsInput, { target: { value: '0' } });
    const startButton = screen.getByTestId('start-arena-button');
    fireEvent.click(startButton);
    expect(screen.getByText(/minimum 1 round required/i)).toBeInTheDocument();
  });
});
