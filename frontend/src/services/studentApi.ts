import { ApiResponse, CreateStudentRequest, Student } from '../types';
import { axiosInstance, ApiResponseWrapper, handleApiError } from './apiUtils';

export const studentApi = {
  getAll: async (): ApiResponseWrapper<Student[]> => {
    try {
      return await axiosInstance.get<ApiResponse<Student[]>>('/students');
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getById: async (id: string): ApiResponseWrapper<Student> => {
    try {
      return await axiosInstance.get<ApiResponse<Student>>(`/students/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  create: async (data: CreateStudentRequest): ApiResponseWrapper<Student> => {
    try {
      return await axiosInstance.post<ApiResponse<Student>>('/students', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (id: string, data: CreateStudentRequest): ApiResponseWrapper<Student> => {
    try {
      return await axiosInstance.put<ApiResponse<Student>>(`/students/${id}`, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (id: string): ApiResponseWrapper<void> => {
    try {
      return await axiosInstance.delete(`/students/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getStats: async (id: string): ApiResponseWrapper<Student> => {
    try {
      return await axiosInstance.get<ApiResponse<Student>>(`/students/${id}/stats`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getHistory: async (id: string): ApiResponseWrapper<any[]> => {
    try {
      return await axiosInstance.get<ApiResponse<any[]>>(`/students/${id}/history`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  resetStats: async (id: string): ApiResponseWrapper<Student> => {
    try {
      return await axiosInstance.post<ApiResponse<Student>>(`/students/${id}/reset`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};