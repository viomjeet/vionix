export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
}

export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  videoUrl?: string | null;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked?: boolean;
}

export interface CommentAuthor {
  id: string;
  name: string;
  username: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentAuthor;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isSelf: boolean;
  posts: Post[];
}

export interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl?: string | null;
  followerCount: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiMessageResponse {
  success: true;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface LikeResponseData {
  isLiked: boolean;
  likeCount: number;
}

export interface BookmarkResponseData {
  isBookmarked: boolean;
}

export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface SearchResults {
  users: SuggestedUser[];
  posts: Post[];
}
