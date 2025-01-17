import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

export const BASE_URL = 'http://localhost:8000/api';

// Create base axios instance with common config
export const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Shared axios instance
export const axiosInstance = createAxiosInstance();

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<any>>;
    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.message || axiosError.message;
    const data = axiosError.response?.data;
    
    throw new ApiError(message, status, data);
  }
  
  if (error instanceof Error) {
    throw new ApiError(error.message);
  }
  
  throw new ApiError('An unknown error occurred');
};

// Type helper for API responses
export type ApiResponseWrapper<T> = Promise<AxiosResponse<ApiResponse<T>>>;