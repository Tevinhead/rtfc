import { create } from 'zustand';
import { createEntityStore, EntityState } from './createEntityStore';
import { flashcardEntityApi, flashcardExtraApi } from '../services/flashcardEntityApi';
import type { Flashcard } from '../types';

interface FlashcardStoreState {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  fetchFlashcards: () => Promise<void>;
  addFlashcard: (data: Partial<Flashcard>) => Promise<void>;
  updateFlashcard: (id: string, data: Partial<Flashcard>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  getByPack: (packId: string) => Promise<void>;
}

type SetState = (
  partial: Partial<FlashcardStoreState> | 
  ((state: FlashcardStoreState) => Partial<FlashcardStoreState>),
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

const createStore = (baseSet: any, get: any, _store: any): FlashcardStoreState => {
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

  const flashcardStore = createEntityStateWrapper<Flashcard>(
    createEntityStore<Flashcard>('flashcards', flashcardEntityApi)
  )(
    (partial: EntityState<Flashcard> | Partial<EntityState<Flashcard>>) => 
      set((state) => ({
        ...state,
        loading: 'loading' in partial ? partial.loading : state.loading,
        error: 'error' in partial ? partial.error : state.error,
        flashcards: 'items' in partial ? partial.items : state.flashcards
      })),
    get,
    _store
  );

  return {
    // Initialize state
    flashcards: [],
    loading: false,
    error: null,

    // Flashcard operations
    fetchFlashcards: flashcardStore.fetchAll,
    addFlashcard: flashcardStore.createItem!,
    updateFlashcard: flashcardStore.updateItem!,
    deleteFlashcard: flashcardStore.deleteItem!,

    // Pack-related operation
    getByPack: async (packId: string) => {
      set({ loading: true, error: null });
      try {
        const response = await flashcardExtraApi.getByPack(packId);
        set((state) => ({
          ...state,
          flashcards: response.data.data,
          loading: false
        }));
      } catch (err) {
        console.error('Failed to get flashcards by pack:', err);
        set((state) => ({
          ...state,
          error: 'Failed to get flashcards by pack',
          loading: false
        }));
      }
    }
  };
};

export const useFlashcardStore = create<FlashcardStoreState>(createStore);
