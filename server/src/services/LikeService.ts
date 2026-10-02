import { LikeRepository } from '../repositories/LikeRepository.js';
import { PostRepository } from '../repositories/PostRepository.js';
import { LikeToggleResponse } from '../types/post.types.js';
import { NotFoundError } from '../utils/errors.js';

export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly postRepository: PostRepository
  ) {}

  async toggleLike(userId: string, postId: string): Promise<LikeToggleResponse> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingLike = await this.likeRepository.findLike(userId, postId);

    if (existingLike) {
      await this.likeRepository.deleteLike(userId, postId);
      const count = await this.likeRepository.countLikes(postId);
      return { isLiked: false, likeCount: count };
    } else {
      await this.likeRepository.createLike(userId, postId);
      const count = await this.likeRepository.countLikes(postId);
      return { isLiked: true, likeCount: count };
    }
  }

  async likePost(userId: string, postId: string): Promise<LikeToggleResponse> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingLike = await this.likeRepository.findLike(userId, postId);
    if (!existingLike) {
      await this.likeRepository.createLike(userId, postId);
    }

    const count = await this.likeRepository.countLikes(postId);
    return { isLiked: true, likeCount: count };
  }

  async unlikePost(userId: string, postId: string): Promise<LikeToggleResponse> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingLike = await this.likeRepository.findLike(userId, postId);
    if (existingLike) {
      await this.likeRepository.deleteLike(userId, postId);
    }

    const count = await this.likeRepository.countLikes(postId);
    return { isLiked: false, likeCount: count };
  }
}
