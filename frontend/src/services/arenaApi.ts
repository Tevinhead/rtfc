import { ApiResponse } from '../types';
import { ArenaSession, ArenaMatch } from '../types/arena';
import { axiosInstance, ApiResponseWrapper, handleApiError } from './apiUtils';
import { transformMatchData } from '../utils/matchTransformUtils';
import { RawMatch } from './matchApi';

export interface ArenaResults {
  rankings: Array<{
    student_id: string;
    name: string;
    elo_rating: number;
    wins: number;
    losses: number;
    fights_played: number;
    elo_change: number;
  }>;
  matches: RawMatch[];
}

interface SetMatchWinnerResponse {
  match: RawMatch;
  arena_session: ArenaSession;
}

export const arenaApi = {
  createSession: async (data: { student_ids: string[]; num_rounds: number }): ApiResponseWrapper<ArenaSession> => {
    try {
      return await axiosInstance.post<ApiResponse<ArenaSession>>('/arena', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getNextMatch: async (arenaId: string): ApiResponseWrapper<RawMatch> => {
    try {
      return await axiosInstance.get<ApiResponse<RawMatch>>(`/arena/${arenaId}/next-match`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  setMatchWinner: async (matchId: string, winnerIds: string[]): ApiResponseWrapper<SetMatchWinnerResponse> => {
    try {
      return await axiosInstance.patch<ApiResponse<SetMatchWinnerResponse>>(`/arena/matches/${matchId}/winner`, {
        winner_ids: winnerIds
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getResults: async (arenaId: string): ApiResponseWrapper<ArenaResults> => {
    try {
      return await axiosInstance.get<ApiResponse<ArenaResults>>(`/arena/${arenaId}/results`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};