import { CommentRepository } from '../repositories/CommentRepository.js';
import { PostRepository } from '../repositories/PostRepository.js';
import { CreateCommentDTO, CommentResponse } from '../types/comment.types.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository
  ) {}

  async addComment(
    userId: string,
    postId: string,
    dto: CreateCommentDTO
  ): Promise<CommentResponse> {
    if (!dto.content || dto.content.trim().length === 0) {
      throw new BadRequestError('Comment content cannot be empty');
    }

    if (dto.content.trim().length > 1000) {
      throw new BadRequestError('Comment cannot exceed 1000 characters');
    }

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const comment = await this.commentRepository.createComment({
      content: dto.content,
      userId,
      postId,
    });

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        username: comment.user.username,
      },
    };
  }

  async getPostComments(postId: string): Promise<CommentResponse[]> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const comments = await this.commentRepository.findByPostId(postId);

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: {
        id: c.user.id,
        name: c.user.name,
        username: c.user.username,
      },
    }));
  }
}
