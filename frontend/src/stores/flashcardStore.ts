import { create } from 'zustand';
import { createEntityStore, EntityState } from './createEntityStore';
import { flashcardEntityApi, flashcardExtraApi } from '../services/flashcardEntityApi';
import type { Flashcard } from '../types';

interface FlashcardStoreState extends EntityState<Flashcard> {
  flashcards: Flashcard[];
  fetchFlashcards: () => Promise<void>;
  addFlashcard: (data: Partial<Flashcard>) => Promise<void>;
  updateFlashcard: (id: string, data: Partial<Flashcard>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  getByPack: (packId: string) => Promise<void>;
}

const createStore = (
  set: (partial: Partial<FlashcardStoreState> | ((state: FlashcardStoreState) => Partial<FlashcardStoreState>)) => void,
  get: () => FlashcardStoreState,
  store: any
): FlashcardStoreState => {
  // Create a wrapped set function that syncs items and flashcards
  const wrappedSet = (
    partial: Partial<FlashcardStoreState> | ((state: FlashcardStoreState) => Partial<FlashcardStoreState>)
  ) => {
    set((state) => {
      const newState = typeof partial === 'function' ? partial(state) : partial;
      return {
        ...state,
        ...newState,
        // Ensure flashcards and items stay in sync
        items: 'items' in newState ? newState.items : state.items,
        flashcards: 'items' in newState ? newState.items : state.flashcards,
      };
    });
  };

  // Create the entity store with our wrapped set
  const entityStore = createEntityStore<Flashcard>(
    'flashcards',
    flashcardEntityApi
  )(wrappedSet, get, store);

  const getByPack = async (packId: string) => {
    wrappedSet({ loading: true, error: null });
    try {
      const response = await flashcardExtraApi.getByPack(packId);
      const items = response.data.data;
      wrappedSet({ items, loading: false });
    } catch (err) {
      console.error('Failed to get flashcards by pack:', err);
      wrappedSet({ error: 'Failed to get flashcards by pack', loading: false });
    }
  };

  // Initialize state and return store interface
  return {
    // Initialize with entityStore's state
    ...entityStore,
    // Add flashcard-specific state
    flashcards: entityStore.items,
    // Add flashcard-specific operations
    fetchFlashcards: entityStore.fetchAll,
    addFlashcard: entityStore.createItem!,
    updateFlashcard: entityStore.updateItem!,
    deleteFlashcard: entityStore.deleteItem!,
    // Add pack operations
    getByPack,
  };
};

export const useFlashcardStore = create<FlashcardStoreState>(createStore);
