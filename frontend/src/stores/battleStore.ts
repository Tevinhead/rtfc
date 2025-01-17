import { create } from 'zustand';
import type { StateCreator, StoreApi } from 'zustand';
import { createMatchSlice, type MatchSlice } from './slices/matchSlice';
import { createArenaSlice, type ArenaSlice } from './slices/arenaSlice';
import type { ArenaMatch, ArenaSession } from '../types/arena';

// Base state interface
interface BattleState {
  loading: boolean;
  error: string | null;
  currentArenaMatch: ArenaMatch | null;
  currentArenaSession: ArenaSession | null;
}

// Combined store type
type BattleStore = BattleState & MatchSlice & ArenaSlice;

// Middleware type
type StoreMiddleware = <T extends BattleState>(
  config: StateCreator<T, [], [], T>
) => StateCreator<T, [], [], T>;

// Middleware to handle loading and error states
const withLoadingMiddleware: StoreMiddleware = (config) => 
  (set, get, api) => {
    const wrappedSet: typeof set = (...args) => {
      const currentState = get();
      const newState = args[0];
      
      // Preserve loading and error states if they're not explicitly set
      if (typeof newState === 'object') {
        if (!('loading' in newState)) {
          (newState as any).loading = currentState.loading;
        }
        if (!('error' in newState)) {
          (newState as any).error = currentState.error;
        }
      }
      
      return set(...args);
    };
    
    return config(wrappedSet, get, api);
  };

// Initial state
const initialState: BattleState = {
  loading: false,
  error: null,
  currentArenaMatch: null,
  currentArenaSession: null,
};

// Create the store with middleware
export const useBattleStore = create<BattleStore>()(
  withLoadingMiddleware((set, get, _store) => ({
    ...initialState,
    ...createMatchSlice(set, get, _store),
    ...createArenaSlice(set, get, _store)
  }))
);
