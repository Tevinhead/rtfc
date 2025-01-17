import type { StateCreator } from 'zustand';
import { matchApi } from '../../services/api';
import { wrapStoreAction } from '../../utils/errorUtils';
import type { ArenaMatch } from '../../types/arena';
import { transformMatchData } from '../../utils/matchTransformUtils';

export interface MatchSlice {
  autoCreateMatch: (numPlayers: number, numRounds: number, studentId: string) => Promise<void>;
}

export interface MatchSliceState {
  currentArenaMatch: ArenaMatch | null;
  loading: boolean;
  error: string | null;
}

type MatchStateCreator = StateCreator<
  MatchSliceState,
  [],
  [],
  MatchSlice
>;

export const createMatchSlice: MatchStateCreator = (set, get, store) => ({
  autoCreateMatch: async (numPlayers: number, numRounds: number, studentId: string) => {
    await wrapStoreAction(
      'auto-create match',
      set,
      async () => {
        const response = await matchApi.autoMatch({ 
          num_players: numPlayers,
          num_rounds: numRounds,
          student_id: studentId
        });
        const transformedMatch = transformMatchData(response.data.data);
        set({ currentArenaMatch: transformedMatch });
      }
    );
  }
});