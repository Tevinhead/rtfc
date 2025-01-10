import type { Flashcard } from '../types';
import { flashcardApi } from './api';
import { EntityApi } from '../stores/createEntityStore';

export const flashcardEntityApi: EntityApi<Flashcard> = {
  getAll: async () => {
    const response = await flashcardApi.getAll();
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await flashcardApi.getById(id);
    return response.data.data;
  },
  create: async (data: Partial<Flashcard>) => {
    const response = await flashcardApi.create({
      question: data.question as string,
      answer: data.answer as string,
      pack_id: data.pack_id as string,
      difficulty: data.difficulty,
    });
    return response.data.data;
  },
  update: async (id: string, data: Partial<Flashcard>) => {
    const response = await flashcardApi.update(id, {
      question: data.question as string,
      answer: data.answer as string,
      pack_id: data.pack_id as string,
      difficulty: data.difficulty,
    });
    return response.data.data;
  },
  delete: async (id: string) => {
    await flashcardApi.delete(id);
  },
};

// Additional flashcard-specific operations that don't fit the EntityApi interface
export const flashcardExtraApi = {
  getByPack: flashcardApi.getByPack,
  getImportTemplate: flashcardApi.getImportTemplate,
  bulkImport: flashcardApi.bulkImport,
  exportPack: flashcardApi.exportPack,
};
