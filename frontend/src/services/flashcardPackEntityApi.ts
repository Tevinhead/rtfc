import type { FlashcardPack, CreateFlashcardPackRequest } from '../types';
import { flashcardPackApi } from './api';
import { EntityApi } from '../stores/createEntityStore';

export const flashcardPackEntityApi: EntityApi<FlashcardPack> = {
  getAll: async () => {
    const response = await flashcardPackApi.getAll();
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await flashcardPackApi.getById(id);
    return response.data.data;
  },
  create: async (data: Partial<FlashcardPack>) => {
    const response = await flashcardPackApi.create({
      name: data.name as string,
      description: data.description,
    });
    return response.data.data;
  },
  update: async (id: string, data: Partial<FlashcardPack>) => {
    const response = await flashcardPackApi.update(id, {
      name: data.name as string,
      description: data.description,
    });
    return response.data.data;
  },
  delete: async (id: string) => {
    await flashcardPackApi.delete(id);
  },
};
