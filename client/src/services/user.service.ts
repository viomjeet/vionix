import { api } from './api.js';
import {
  UserProfile,
  SuggestedUser,
  ApiMessageResponse,
  UpdateProfileDTO,
  SearchResults,
} from '../types/index.js';

export const userService = {
  async getUserProfile(username: string): Promise<UserProfile> {
    const res = await api.get<UserProfile>(`/users/${username}`);
    return res.data;
  },

  async updateProfile(dto: UpdateProfileDTO): Promise<UserProfile> {
    const res = await api.put<UserProfile>('/users/profile', dto);
    return res.data;
  },

  async search(query: string): Promise<SearchResults> {
    const res = await api.get<SearchResults>(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  async getSuggestedUsers(): Promise<SuggestedUser[]> {
    const res = await api.get<SuggestedUser[]>('/users/suggested');
    return res.data;
  },

  async followUser(id: string): Promise<ApiMessageResponse> {
    return api.postMessage(`/users/${id}/follow`);
  },

  async unfollowUser(id: string): Promise<ApiMessageResponse> {
    return api.deleteMessage(`/users/${id}/follow`);
  },
};
