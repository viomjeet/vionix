import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiMessageResponse } from '../types/index.js';

const API_BASE_URL = '/api';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if present in localStorage
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor to extract clean backend error messages
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data &&
      typeof error.response.data.message === 'string'
        ? error.response.data.message
        : error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

class ApiClient {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await axiosInstance.get<ApiResponse<T>>(endpoint);
    return response.data;
  }

  async post<T, B = unknown>(endpoint: string, body?: B): Promise<ApiResponse<T>> {
    const response = await axiosInstance.post<ApiResponse<T>>(endpoint, body);
    return response.data;
  }

  async put<T, B = unknown>(endpoint: string, body?: B): Promise<ApiResponse<T>> {
    const response = await axiosInstance.put<ApiResponse<T>>(endpoint, body);
    return response.data;
  }

  async postMessage<B = unknown>(endpoint: string, body?: B): Promise<ApiMessageResponse> {
    const response = await axiosInstance.post<ApiMessageResponse>(endpoint, body);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await axiosInstance.delete<ApiResponse<T>>(endpoint);
    return response.data;
  }

  async deleteMessage(endpoint: string): Promise<ApiMessageResponse> {
    const response = await axiosInstance.delete<ApiMessageResponse>(endpoint);
    return response.data;
  }
}

export const api = new ApiClient();

