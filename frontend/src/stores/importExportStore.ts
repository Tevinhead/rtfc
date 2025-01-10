import { create } from 'zustand';
import { flashcardExtraApi } from '../services/flashcardEntityApi';
import { useFlashcardStore } from './flashcardStore';

interface ImportExportStoreState {
  loading: boolean;
  error: string | null;
  bulkImport: (file: File) => Promise<void>;
  getImportTemplate: () => Promise<void>;
  exportPack: (packId: string) => Promise<void>;
}

const createStore = (set: any, get: any): ImportExportStoreState => ({
  loading: false,
  error: null,

  bulkImport: async (file: File) => {
    set({ loading: true, error: null });
    try {
      await flashcardExtraApi.bulkImport(file);
      // Refresh the flashcards list after bulk import
      await useFlashcardStore.getState().fetchFlashcards();
      set({ loading: false });
    } catch (err) {
      console.error('Failed to bulk import flashcards:', err);
      set({
        error: 'Failed to bulk import flashcards',
        loading: false
      });
    }
  },

  getImportTemplate: async () => {
    try {
      await flashcardExtraApi.getImportTemplate();
    } catch (err) {
      console.error('Failed to get import template:', err);
      set({ error: 'Failed to get import template' });
    }
  },

  exportPack: async (packId: string) => {
    try {
      await flashcardExtraApi.exportPack(packId);
    } catch (err) {
      console.error('Failed to export pack:', err);
      set({ error: 'Failed to export pack' });
    }
  }
});

export const useImportExportStore = create<ImportExportStoreState>(createStore);
