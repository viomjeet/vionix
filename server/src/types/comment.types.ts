export interface CreateCommentDTO {
  content: string;
}

export interface CommentAuthor {
  id: string;
  name: string;
  username: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  user: CommentAuthor;
}
