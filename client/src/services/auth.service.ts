import { api } from './api.js';
import { User, LoginResponseData, ApiMessageResponse } from '../types/index.js';

export const authService = {
  async register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<ApiMessageResponse> {
    return api.postMessage('/auth/register', data);
  },

  async login(data: {
    identifier: string;
    password: string;
  }): Promise<LoginResponseData> {
    const res = await api.post<LoginResponseData>('/auth/login', data);
    return res.data;
  },

  async loginWithGoogle(data: {
    credential?: string;
    email?: string;
    name?: string;
    googleId?: string;
    avatarUrl?: string;
  }): Promise<LoginResponseData> {
    const res = await api.post<LoginResponseData>('/auth/google', data);
    return res.data;
  },

  async forgotPassword(data: { email: string }): Promise<ApiMessageResponse> {
    return api.postMessage('/auth/forgot-password', data);
  },

  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<ApiMessageResponse> {
    return api.postMessage('/auth/reset-password', data);
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};
