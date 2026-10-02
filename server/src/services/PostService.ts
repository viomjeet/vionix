import { PostRepository } from '../repositories/PostRepository.js';
import { FollowRepository } from '../repositories/FollowRepository.js';
import { LikeRepository } from '../repositories/LikeRepository.js';
import { BookmarkRepository } from '../repositories/BookmarkRepository.js';
import { BookmarkToggleResponse, CreatePostDTO, PostResponse } from '../types/post.types.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';

export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly followRepository: FollowRepository,
    private readonly likeRepository: LikeRepository,
    private readonly bookmarkRepository: BookmarkRepository
  ) {}

  async createPost(userId: string, dto: CreatePostDTO): Promise<PostResponse> {
    if (!dto.content || dto.content.trim().length === 0) {
      throw new BadRequestError('Post content cannot be empty');
    }

    if (dto.content.trim().length > 2000) {
      throw new BadRequestError('Post content cannot exceed 2000 characters');
    }

    const post = await this.postRepository.createPost({
      content: dto.content,
      imageUrl: dto.imageUrl,
      videoUrl: dto.videoUrl,
      authorId: userId,
    });

    return {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      createdAt: post.createdAt,
      author: {
        id: post.author.id,
        name: post.author.name,
        username: post.author.username,
        avatarUrl: post.author.avatarUrl,
      },
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLiked: false,
      isBookmarked: false,
    };
  }

  async getHomeFeed(userId: string): Promise<PostResponse[]> {
    const followingIds = await this.followRepository.getFollowingIds(userId);
    const authorIds = [userId, ...followingIds];

    const posts = await this.postRepository.findFeedPosts(authorIds);
    const postIds = posts.map((p) => p.id);
    const likedSet = await this.likeRepository.getLikedPostIds(userId, postIds);
    const bookmarkedSet = await this.bookmarkRepository.getBookmarkedPostIds(userId, postIds);

    return posts.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      videoUrl: p.videoUrl,
      createdAt: p.createdAt,
      author: {
        id: p.author.id,
        name: p.author.name,
        username: p.author.username,
        avatarUrl: p.author.avatarUrl,
      },
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      isLiked: likedSet.has(p.id),
      isBookmarked: bookmarkedSet.has(p.id),
    }));
  }

  async getExploreFeed(userId: string): Promise<PostResponse[]> {
    const posts = await this.postRepository.findExplorePosts();
    const postIds = posts.map((p) => p.id);
    const likedSet = await this.likeRepository.getLikedPostIds(userId, postIds);
    const bookmarkedSet = await this.bookmarkRepository.getBookmarkedPostIds(userId, postIds);

    return posts.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      videoUrl: p.videoUrl,
      createdAt: p.createdAt,
      author: {
        id: p.author.id,
        name: p.author.name,
        username: p.author.username,
        avatarUrl: p.author.avatarUrl,
      },
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      isLiked: likedSet.has(p.id),
      isBookmarked: bookmarkedSet.has(p.id),
    }));
  }

  async getBookmarkedPosts(userId: string): Promise<PostResponse[]> {
    const posts = await this.bookmarkRepository.findBookmarkedPosts(userId);
    const postIds = posts.map((p) => p.id);
    const likedSet = await this.likeRepository.getLikedPostIds(userId, postIds);

    return posts.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      videoUrl: p.videoUrl,
      createdAt: p.createdAt,
      author: {
        id: p.author.id,
        name: p.author.name,
        username: p.author.username,
        avatarUrl: p.author.avatarUrl,
      },
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      isLiked: likedSet.has(p.id),
      isBookmarked: true,
    }));
  }

  async toggleBookmark(userId: string, postId: string): Promise<BookmarkToggleResponse> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const isBookmarked = await this.bookmarkRepository.isBookmarkedByUser(userId, postId);

    if (isBookmarked) {
      await this.bookmarkRepository.deleteBookmark(userId, postId);
      return { isBookmarked: false };
    } else {
      await this.bookmarkRepository.createBookmark(userId, postId);
      return { isBookmarked: true };
    }
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    await this.postRepository.deletePost(postId);
  }
}
