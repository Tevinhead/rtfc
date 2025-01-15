import { create } from 'zustand';
import { createEntityStore, EntityState } from './createEntityStore';
import { flashcardPackEntityApi } from '../services/flashcardPackEntityApi';
import type { FlashcardPack } from '../types';

interface PackStoreState {
  packs: FlashcardPack[];
  loading: boolean;
  error: string | null;
  fetchPacks: () => Promise<void>;
  addPack: (data: Partial<FlashcardPack>) => Promise<void>;
  updatePack: (id: string, data: Partial<FlashcardPack>) => Promise<void>;
  deletePack: (id: string) => Promise<void>;
}

type SetState = (
  partial: Partial<PackStoreState> | 
  ((state: PackStoreState) => Partial<PackStoreState>),
  replace?: boolean
) => void;

const createCustomSet = (baseSet: SetState): SetState => (partial) => {
  baseSet((state) => {
    const newState = typeof partial === 'function' ? partial(state) : partial;
    return {
      ...state,
      ...newState
    };
  });
};

const createStore = (baseSet: any, get: any, _store: any): PackStoreState => {
  const set = createCustomSet(baseSet as SetState);
  
  const entityStore = createEntityStore<FlashcardPack>('packs', flashcardPackEntityApi)(
    (partial: EntityState<FlashcardPack> | Partial<EntityState<FlashcardPack>>) =>
      set((state) => ({
        ...state,
        loading: 'loading' in partial ? partial.loading : state.loading,
        error: 'error' in partial ? partial.error : state.error,
        packs: 'items' in partial ? partial.items : state.packs
      })),
    () => ({
      items: get().packs,
      loading: get().loading,
      error: get().error,
      fetchAll: get().fetchPacks,
    }),
    _store
  );

  return {
    // Initialize state
    packs: [],
    loading: false,
    error: null,

    // Pack operations
    fetchPacks: entityStore.fetchAll,
    addPack: entityStore.createItem!,
    updatePack: entityStore.updateItem!,
    deletePack: entityStore.deleteItem!
  };
};

export const usePackStore = create<PackStoreState>(createStore);
