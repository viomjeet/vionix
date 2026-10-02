import { api } from './api.js';
import {
  Post,
  Comment,
  LikeResponseData,
  BookmarkResponseData,
  ApiMessageResponse,
} from '../types/index.js';

export const postService = {
  async createPost(data: {
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
  }): Promise<Post> {
    const res = await api.post<Post>('/posts', data);
    return res.data;
  },

  async getHomeFeed(): Promise<Post[]> {
    const res = await api.get<Post[]>('/posts/feed');
    return res.data;
  },

  async getExploreFeed(): Promise<Post[]> {
    const res = await api.get<Post[]>('/posts/explore');
    return res.data;
  },

  async getBookmarkedPosts(): Promise<Post[]> {
    const res = await api.get<Post[]>('/posts/bookmarks');
    return res.data;
  },

  async toggleBookmark(id: string): Promise<BookmarkResponseData> {
    const res = await api.post<BookmarkResponseData>(`/posts/${id}/bookmark`);
    return res.data;
  },

  async deletePost(id: string): Promise<ApiMessageResponse> {
    return api.deleteMessage(`/posts/${id}`);
  },

  async toggleLike(id: string): Promise<LikeResponseData> {
    const res = await api.post<LikeResponseData>(`/posts/${id}/like`);
    return res.data;
  },

  async addComment(postId: string, content: string): Promise<Comment> {
    const res = await api.post<Comment>(`/posts/${postId}/comments`, { content });
    return res.data;
  },

  async getComments(postId: string): Promise<Comment[]> {
    const res = await api.get<Comment[]>(`/posts/${postId}/comments`);
    return res.data;
  },
};
