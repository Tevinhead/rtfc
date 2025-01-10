import axios from 'axios';
import type {
  ApiResponse,
  Student,
  Flashcard,
  FlashcardPack,
  CreateStudentRequest,
  CreateFlashcardRequest,
  CreateFlashcardPackRequest,
  BulkImportResult,
  FlashcardStats,
  FlashcardUsageStats,
  FlashcardArenaStats,
} from '../types';

const BASE_URL = 'http://localhost:8000/api';

// Create axios instances
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Match API
export const matchApi = {
  createMultiplayer: (data: { player_ids: string[], num_rounds: number }) =>
    axiosInstance.post('/matches/multiplayer', data),
  
  autoMatch: (data: { num_players: number, num_rounds: number, student_id: string }) =>
    axiosInstance.post('/matches/auto-match', data),
  
  getById: (matchId: string) =>
    axiosInstance.get(`/matches/${matchId}`),
  
  updateStatus: (matchId: string, status: string) =>
    axiosInstance.patch(`/matches/${matchId}/status`, { status }),
};

// Round API
export const roundApi = {
  create: (data: { match_id: string, flashcard_id: string }) =>
    axiosInstance.post('/matches/rounds', data),
  
  submitAnswer: (roundId: string, playerId: string, answer: string) =>
    axiosInstance.post(`/matches/rounds/${roundId}/answer`, { 
      player_id: playerId,
      answer 
    }),
  
  setWinners: (roundId: string, data: { winner_ids: string[] }) =>
    axiosInstance.post(`/matches/rounds/${roundId}/winner`, data),
};

// Arena API
export const arenaApi = {
  createSession: (data: { student_ids: string[], num_rounds: number }) =>
    axiosInstance.post('/arena', data),
  
  getNextMatch: (arenaId: string) =>
    axiosInstance.get(`/arena/${arenaId}/next-match`),
  
  setMatchWinner: (matchId: string, winnerIds: string[]) =>
    axiosInstance.patch(`/arena/matches/${matchId}/winner`, { winner_ids: winnerIds }),
  
  getResults: (arenaId: string) =>
    axiosInstance.get(`/arena/${arenaId}/results`),
};

// Student API
export const studentApi = {
  getAll: () => axiosInstance.get<ApiResponse<Student[]>>('/students'),
  getById: (id: string) => axiosInstance.get<ApiResponse<Student>>(`/students/${id}`),
  create: (data: CreateStudentRequest) => axiosInstance.post<ApiResponse<Student>>('/students', data),
  update: (id: string, data: CreateStudentRequest) => axiosInstance.put<ApiResponse<Student>>(`/students/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`/students/${id}`),
  getStats: (id: string) => axiosInstance.get<ApiResponse<Student>>(`/students/${id}/stats`),
  getHistory: (id: string) => axiosInstance.get<ApiResponse<any[]>>(`/students/${id}/history`),
};

// Flashcard API
export const flashcardApi = {
  getAll: () => axiosInstance.get<ApiResponse<Flashcard[]>>('/flashcards/all'),
  getById: (id: string) => axiosInstance.get<ApiResponse<Flashcard>>(`/flashcards/${id}`),
  create: (data: CreateFlashcardRequest) => axiosInstance.post<ApiResponse<Flashcard>>('/flashcards', data),
  update: (id: string, data: CreateFlashcardRequest) => axiosInstance.put<ApiResponse<Flashcard>>(`/flashcards/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`/flashcards/${id}`),
  getByPack: (packId: string) => axiosInstance.get<ApiResponse<Flashcard[]>>(`/flashcards/pack/${packId}`),
  
  // Statistics endpoints
  getStats: (id: string) => axiosInstance.get<ApiResponse<FlashcardStats>>(`/stats/flashcards/${id}/stats`),
  getMostUsed: (limit?: number) => axiosInstance.get<ApiResponse<FlashcardUsageStats[]>>('/stats/flashcards/most-used', {
    params: { limit }
  }),
  getArenaStats: (arenaId: string) => axiosInstance.get<ApiResponse<FlashcardArenaStats[]>>(`/stats/arena/${arenaId}/flashcard-stats`),

  // Bulk ops
  getImportTemplate: () => axiosInstance.post<Blob>('/flashcards/template', null, { responseType: 'blob' }),
  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<ApiResponse<BulkImportResult>>('/flashcards/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportPack: (packId: string) => axiosInstance.get<Blob>(`/flashcards/export/${packId}`, { responseType: 'blob' }),
};

// Flashcard Pack API
export const flashcardPackApi = {
  getAll: () => axiosInstance.get<ApiResponse<FlashcardPack[]>>('/flashcards/packs'),
  getById: (id: string) => axiosInstance.get<ApiResponse<FlashcardPack>>(`/flashcards/packs/${id}`),
  create: (data: CreateFlashcardPackRequest) => axiosInstance.post<ApiResponse<FlashcardPack>>('/flashcards/packs', data),
  update: (id: string, data: CreateFlashcardPackRequest) => axiosInstance.put<ApiResponse<FlashcardPack>>(`/flashcards/packs/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`/flashcards/packs/${id}`),
};
