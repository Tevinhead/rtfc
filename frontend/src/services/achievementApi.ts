import { axiosInstance, ApiResponseWrapper, handleApiError } from './apiUtils';
import type { Achievement, StudentAchievementResponse } from '../types';

export const achievementApi = {
  getAllAchievements: async (): ApiResponseWrapper<Achievement[]> => {
    try {
      // GET /api/achievements
      return await axiosInstance.get(`/achievements`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getStudentAchievements: async (studentId: string): Promise<StudentAchievementResponse[]> => {
    try {
      // GET /api/students/{student_id}/achievements
      const response = await axiosInstance.get<StudentAchievementResponse[]>(`/students/${studentId}/achievements`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
