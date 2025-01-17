import { ApiResponse, FlashcardPack, CreateFlashcardPackRequest } from '../types';
import { axiosInstance, ApiResponseWrapper, handleApiError } from './apiUtils';

export const flashcardPackApi = {
  getAll: async (): ApiResponseWrapper<FlashcardPack[]> => {
    try {
      return await axiosInstance.get<ApiResponse<FlashcardPack[]>>('/flashcards/packs');
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getById: async (id: string): ApiResponseWrapper<FlashcardPack> => {
    try {
      return await axiosInstance.get<ApiResponse<FlashcardPack>>(`/flashcards/packs/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  create: async (data: CreateFlashcardPackRequest): ApiResponseWrapper<FlashcardPack> => {
    try {
      return await axiosInstance.post<ApiResponse<FlashcardPack>>('/flashcards/packs', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (id: string, data: CreateFlashcardPackRequest): ApiResponseWrapper<FlashcardPack> => {
    try {
      return await axiosInstance.put<ApiResponse<FlashcardPack>>(`/flashcards/packs/${id}`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (id: string): ApiResponseWrapper<void> => {
    try {
      return await axiosInstance.delete(`/flashcards/packs/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};