import { PostResponse } from './post.types.js';

export interface UserProfileResponse {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isSelf: boolean;
  posts: PostResponse[];
}

export interface SuggestedUserResponse {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  followerCount: number;
}

export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface SearchResultsResponse {
  users: SuggestedUserResponse[];
  posts: PostResponse[];
}
