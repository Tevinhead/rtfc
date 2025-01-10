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
  
  type EntityStateWrapper = <T>(
    entityStore: (
      set: any,
      get: () => EntityState<T>,
      store: any
    ) => EntityState<T>
  ) => (set: any, get: any, store: any) => EntityState<T>;

  const createEntityStateWrapper: EntityStateWrapper = <T>(
    entityStore: (
      set: any,
      get: () => EntityState<T>,
      store: any
    ) => EntityState<T>
  ) => (set, get, store) => {
    const wrappedGet = () => ({
      items: [],
      loading: false,
      error: null,
      fetchAll: async () => {},
      ...get()
    }) as EntityState<T>;
    
    return entityStore(set, wrappedGet, store);
  };

  const packStore = createEntityStateWrapper<FlashcardPack>(
    createEntityStore<FlashcardPack>('packs', flashcardPackEntityApi)
  )(
    (partial: EntityState<FlashcardPack> | Partial<EntityState<FlashcardPack>>) => 
      set((state) => ({
        ...state,
        loading: 'loading' in partial ? partial.loading : state.loading,
        error: 'error' in partial ? partial.error : state.error,
        packs: 'items' in partial ? partial.items : state.packs
      })),
    get,
    _store
  );

  return {
    // Initialize state
    packs: [],
    loading: false,
    error: null,

    // Pack operations
    fetchPacks: packStore.fetchAll,
    addPack: packStore.createItem!,
    updatePack: packStore.updateItem!,
    deletePack: packStore.deleteItem!
  };
};

export const usePackStore = create<PackStoreState>(createStore);
