import type { StateCreator } from 'zustand';
import type { ArenaMatch, ArenaSession } from '../../types/arena';
import { arenaApi } from '../../services/api';
import { wrapStoreAction } from '../../utils/errorUtils';
import { transformMatchData } from '../../utils/matchTransformUtils';
import { ArenaSessionStatus } from '../../types';

export interface ArenaSlice {
  createArenaSession: (playerIds: string[], numRounds: number) => Promise<void>;
  getNextArenaMatch: () => Promise<void>;
  setArenaMatchWinner: (winnerIds: string[]) => Promise<{
    match: ArenaMatch;
    arena_session: ArenaSession;
  }>;
  getArenaResults: () => Promise<void>;
  resetArena: () => void;
}

export interface ArenaSliceState {
  currentArenaSession: ArenaSession | null;
  currentArenaMatch: ArenaMatch | null;
  loading: boolean;
  error: string | null;
}

type ArenaStateCreator = StateCreator<
  ArenaSliceState,
  [],
  [],
  ArenaSlice
>;

export const createArenaSlice: ArenaStateCreator = (set, get, store) => ({
  createArenaSession: async (playerIds: string[], numRounds: number) => {
    await wrapStoreAction(
      'create arena session',
      set,
      async () => {
        const response = await arenaApi.createSession({ 
          student_ids: playerIds,
          num_rounds: numRounds 
        });
        set({ currentArenaSession: response.data.data });
      }
    );
  },

  getNextArenaMatch: async () => {
    await wrapStoreAction(
      'get next match',
      set,
      async () => {
        const arenaSession = get().currentArenaSession;
        if (!arenaSession) throw new Error('No active arena session');

        const response = await arenaApi.getNextMatch(arenaSession.id);
        const transformedMatch = transformMatchData(response.data.data);
        set({ currentArenaMatch: transformedMatch });
      }
    );
  },

  setArenaMatchWinner: async (winnerIds: string[]) => {
    const result = await wrapStoreAction(
      'set match winner',
      set,
      async () => {
        const match = get().currentArenaMatch;
        if (!match) throw new Error('No active match');

        const response = await arenaApi.setMatchWinner(match.id, winnerIds);
        const { match: updatedMatch, arena_session: updatedArenaSession } = response.data.data;
        const transformedMatch = transformMatchData({ ...updatedMatch, winner_ids: winnerIds });

        set({
          currentArenaSession: updatedArenaSession,
          currentArenaMatch: transformedMatch
        });

        return {
          match: transformedMatch,
          arena_session: updatedArenaSession
        };
      }
    );
    
    if (!result) {
      throw new Error('Failed to set match winner');
    }
    
    return result;
  },

  getArenaResults: async () => {
    await wrapStoreAction(
      'get arena results',
      set,
      async () => {
        const arenaSession = get().currentArenaSession;
        if (!arenaSession) {
          console.warn('No arena session to fetch results for');
          return;
        }

        const response = await arenaApi.getResults(arenaSession.id);
        const { rankings } = response.data.data;

        set((state) => ({
          currentArenaSession: state.currentArenaSession
            ? {
                ...state.currentArenaSession,
                participants: rankings,
                status: ArenaSessionStatus.COMPLETED,
              }
            : null,
          currentArenaMatch: null
        }));
      }
    );
  },

  resetArena: () => {
    set({
      currentArenaSession: null,
      currentArenaMatch: null,
      error: null,
      loading: false
    });
  }
});