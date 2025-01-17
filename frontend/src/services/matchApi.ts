import { ApiResponse } from '../types';
import { axiosInstance, ApiResponseWrapper, handleApiError } from './apiUtils';
import { MatchStatus } from '../types';

// Shared interface for raw match data from API
export interface RawMatch {
  id: string;
  status: MatchStatus;
  num_rounds: number;
  rounds_completed: number;
  participants: Array<{
    student_id: string;
    elo_before: number;
    elo_after: number | null;
  }>;
  winner_ids: string[];
}

interface Round {
  id: string;
  match_id: string;
  flashcard_id: string;
  status: string;
  answers: {
    player_id: string;
    answer: string;
  }[];
  winner_ids: string[];
}

// Match API
export const matchApi = {
  createMultiplayer: async (data: { player_ids: string[]; num_rounds: number }): ApiResponseWrapper<RawMatch> => {
    try {
      return await axiosInstance.post<ApiResponse<RawMatch>>('/matches/multiplayer', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  autoMatch: async (data: { num_players: number; num_rounds: number; student_id: string }): ApiResponseWrapper<RawMatch> => {
    try {
      return await axiosInstance.post<ApiResponse<RawMatch>>('/matches/auto-match', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getById: async (matchId: string): ApiResponseWrapper<RawMatch> => {
    try {
      return await axiosInstance.get<ApiResponse<RawMatch>>(`/matches/${matchId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateStatus: async (matchId: string, status: MatchStatus): ApiResponseWrapper<RawMatch> => {
    try {
      return await axiosInstance.patch<ApiResponse<RawMatch>>(`/matches/${matchId}/status`, { status });
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Round API
export const roundApi = {
  create: async (data: { match_id: string; flashcard_id: string }): ApiResponseWrapper<Round> => {
    try {
      return await axiosInstance.post<ApiResponse<Round>>('/matches/rounds', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  submitAnswer: async (roundId: string, playerId: string, answer: string): ApiResponseWrapper<Round> => {
    try {
      return await axiosInstance.post<ApiResponse<Round>>(`/matches/rounds/${roundId}/answer`, {
        player_id: playerId,
        answer,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  setWinners: async (roundId: string, winnerIds: string[]): ApiResponseWrapper<Round> => {
    try {
      return await axiosInstance.post<ApiResponse<Round>>(`/matches/rounds/${roundId}/winner`, {
        winner_ids: winnerIds,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },
};