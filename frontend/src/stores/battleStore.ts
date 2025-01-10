import { create } from 'zustand';
import { arenaApi, matchApi } from '../services/api';
import { MatchStatus, ArenaSessionStatus } from '../types';
import type { Match } from '../types';

interface ArenaSession {
  id: string;
  status: ArenaSessionStatus;
  num_rounds: number;
  rounds_completed: number;
  participants: Array<{
    student_id: string;
    name: string;
    elo_rating: number;
    wins: number;
    losses: number;
    fights_played: number;
    elo_change: number;
  }>;
}

interface ArenaMatch {
  id: string;
  status: MatchStatus;
  num_rounds: number;
  rounds_completed: number;
  player1_id: string;
  player2_id: string;
  winner_ids: string[];
  player1_elo_before: number;
  player2_elo_before: number;
  player1_elo_after: number | null;
  player2_elo_after: number | null;
}

interface BattleStoreState {
  currentArenaSession: ArenaSession | null;
  currentArenaMatch: ArenaMatch | null;
  loading: boolean;
  error: string | null;

  // Match Actions
  autoCreateMatch: (numPlayers: number, numRounds: number, studentId: string) => Promise<void>;

  // Arena Actions
  createArenaSession: (playerIds: string[], numRounds: number) => Promise<void>;
  getNextArenaMatch: () => Promise<void>;
  setArenaMatchWinner: (winnerIds: string[]) => Promise<{
    match: Match;
    arena_session: ArenaSession;
  }>;
  getArenaResults: () => Promise<void>;
  resetArena: () => void;
}

export const useBattleStore = create<BattleStoreState>((set, get) => ({
  currentArenaSession: null,
  currentArenaMatch: null,
  loading: false,
  error: null,

  autoCreateMatch: async (numPlayers: number, numRounds: number, studentId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await matchApi.autoMatch({ 
        num_players: numPlayers,
        num_rounds: numRounds,
        student_id: studentId
      });
      set({ loading: false });
      return response.data;
    } catch (err) {
      console.error('Failed to auto-create match:', err);
      set({ 
        error: 'Failed to auto-create match',
        loading: false 
      });
    }
  },

  createArenaSession: async (playerIds: string[], numRounds: number) => {
    set({ loading: true, error: null });
    try {
      const response = await arenaApi.createSession({ 
        student_ids: playerIds,
        num_rounds: numRounds 
      });
      set({ 
        currentArenaSession: response.data.data,
        loading: false 
      });
    } catch (err) {
      console.error('Failed to create arena session:', err);
      set({ 
        error: 'Failed to create arena session',
        loading: false 
      });
    }
  },

  getNextArenaMatch: async () => {
    set({ loading: true, error: null });
    try {
      const arenaSession = get().currentArenaSession;
      if (!arenaSession) throw new Error('No active arena session');

      const response = await arenaApi.getNextMatch(arenaSession.id);
      const match = response.data.data;
      
      // Transform match data to expected frontend format
      if (match.participants && match.participants.length === 2) {
        const transformedMatch = {
          ...match,
          player1_id: match.participants[0].student_id,
          player2_id: match.participants[1].student_id,
          player1_elo_before: match.participants[0].elo_before,
          player2_elo_before: match.participants[1].elo_before,
          player1_elo_after: match.participants[0].elo_after,
          player2_elo_after: match.participants[1].elo_after,
          winner_ids: []
        };
        set({ 
          currentArenaMatch: transformedMatch,
          loading: false 
        });
      } else {
        throw new Error('Invalid match data: Expected exactly 2 participants');
      }
    } catch (err) {
      console.error('Failed to get next match:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to get next match',
        loading: false 
      });
    }
  },

  setArenaMatchWinner: async (winnerIds: string[]) => {
    set({ loading: true, error: null });
    try {
      const match = get().currentArenaMatch;
      if (!match) throw new Error('No active match');

      const response = await arenaApi.setMatchWinner(match.id, winnerIds);
      if (!response?.data?.data) {
        throw new Error('Invalid response from setMatchWinner');
      }

      const { match: updatedMatch, arena_session: updatedArenaSession } = response.data.data;

      // Transform updated match data
      const transformedMatch = {
        ...updatedMatch,
        player1_id: updatedMatch.participants[0].student_id,
        player2_id: updatedMatch.participants[1].student_id,
        player1_elo_before: updatedMatch.participants[0].elo_before,
        player2_elo_before: updatedMatch.participants[1].elo_before,
        player1_elo_after: updatedMatch.participants[0].elo_after,
        player2_elo_after: updatedMatch.participants[1].elo_after,
        winner_ids: winnerIds
      };

      // Update arena session with the correct data from backend
      set({
        currentArenaSession: updatedArenaSession,
        currentArenaMatch: transformedMatch,
        loading: false
      });

      // Return the response data for the hook to use
      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set match winner';
      console.error('Failed to set match winner:', err);
      set({ 
        error: errorMessage,
        loading: false 
      });
      throw err; // Re-throw to let hook handle error
    }
  },

  getArenaResults: async () => {
    set({ loading: true, error: null });
    try {
      const arenaSession = get().currentArenaSession;
      if (!arenaSession) {
        console.warn('No arena session to fetch results for');
        set({ loading: false });
        return;
      }

      const response = await arenaApi.getResults(arenaSession.id);
      const finalParticipants = response.data.data;

      // Merge final results into current session
      set((state) => ({
        currentArenaSession: state.currentArenaSession
          ? {
              ...state.currentArenaSession,
              participants: finalParticipants,
              status: ArenaSessionStatus.COMPLETED,
            }
          : null,
        currentArenaMatch: null, // no active match anymore
        loading: false,
        error: null,
      }));
    } catch (err) {
      console.error('Failed to get arena results:', err);
      set({ 
        error: 'Failed to get arena results',
        loading: false 
      });
    }
  },

  resetArena: () => {
    set({
      currentArenaSession: null,
      currentArenaMatch: null,
      error: null,
      loading: false
    });
  }
}));
