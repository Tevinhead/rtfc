import { ApiResponse, Flashcard, CreateFlashcardRequest, FlashcardStats, FlashcardUsageStats, FlashcardArenaStats, BulkImportResult } from '../types';
import { axiosInstance, ApiResponseWrapper, handleApiError } from './apiUtils';

export const flashcardApi = {
  getAll: async (): ApiResponseWrapper<Flashcard[]> => {
    try {
      return await axiosInstance.get<ApiResponse<Flashcard[]>>('/flashcards/all');
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getById: async (id: string): ApiResponseWrapper<Flashcard> => {
    try {
      return await axiosInstance.get<ApiResponse<Flashcard>>(`/flashcards/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  create: async (data: CreateFlashcardRequest): ApiResponseWrapper<Flashcard> => {
    try {
      return await axiosInstance.post<ApiResponse<Flashcard>>('/flashcards', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (id: string, data: CreateFlashcardRequest): ApiResponseWrapper<Flashcard> => {
    try {
      return await axiosInstance.put<ApiResponse<Flashcard>>(`/flashcards/${id}`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (id: string): ApiResponseWrapper<void> => {
    try {
      return await axiosInstance.delete(`/flashcards/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getByPack: async (packId: string): ApiResponseWrapper<Flashcard[]> => {
    try {
      return await axiosInstance.get<ApiResponse<Flashcard[]>>(`/flashcards/pack/${packId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Statistics endpoints
  getStats: async (id: string): ApiResponseWrapper<FlashcardStats> => {
    try {
      return await axiosInstance.get<ApiResponse<FlashcardStats>>(`/stats/flashcards/${id}/stats`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getMostUsed: async (limit?: number): ApiResponseWrapper<FlashcardUsageStats[]> => {
    try {
      return await axiosInstance.get<ApiResponse<FlashcardUsageStats[]>>('/stats/flashcards/most-used', {
        params: { limit }
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getArenaStats: async (arenaId: string): ApiResponseWrapper<FlashcardArenaStats[]> => {
    try {
      return await axiosInstance.get<ApiResponse<FlashcardArenaStats[]>>(`/stats/arena/${arenaId}/flashcard-stats`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk operations
  getImportTemplate: async (): Promise<Blob> => {
    try {
      const response = await axiosInstance.post<Blob>('/flashcards/template', null, { 
        responseType: 'blob' 
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  bulkImport: async (file: File): ApiResponseWrapper<BulkImportResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await axiosInstance.post<ApiResponse<BulkImportResult>>('/flashcards/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  exportPack: async (packId: string): Promise<Blob> => {
    try {
      const response = await axiosInstance.get<Blob>(`/flashcards/export/${packId}`, { 
        responseType: 'blob' 
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};