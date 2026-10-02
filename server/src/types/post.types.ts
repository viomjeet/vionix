export interface CreatePostDTO {
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
}

export interface PostResponse {
  id: string;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: Date;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface LikeToggleResponse {
  isLiked: boolean;
  likeCount: number;
}

export interface BookmarkToggleResponse {
  isBookmarked: boolean;
}
