import { UserRepository } from '../repositories/UserRepository.js';
import { FollowRepository } from '../repositories/FollowRepository.js';
import { PostRepository } from '../repositories/PostRepository.js';
import { LikeRepository } from '../repositories/LikeRepository.js';
import { BookmarkRepository } from '../repositories/BookmarkRepository.js';
import {
  UserProfileResponse,
  SuggestedUserResponse,
  UpdateProfileDTO,
  SearchResultsResponse,
} from '../types/user.types.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly followRepository: FollowRepository,
    private readonly postRepository: PostRepository,
    private readonly likeRepository: LikeRepository,
    private readonly bookmarkRepository: BookmarkRepository
  ) {}

  async getUserProfile(
    currentUserId: string,
    targetUsername: string
  ): Promise<UserProfileResponse> {
    const user = await this.userRepository.findByUsername(targetUsername);
    if (!user) {
      throw new NotFoundError(`User @${targetUsername} not found`);
    }

    const isSelf = currentUserId === user.id;
    const isFollowing = isSelf
      ? false
      : await this.followRepository.isFollowing(currentUserId, user.id);

    const followerCount = await this.followRepository.countFollowers(user.id);
    const followingCount = await this.followRepository.countFollowing(user.id);

    const posts = await this.postRepository.findByAuthorId(user.id);
    const postIds = posts.map((p) => p.id);
    const likedSet = await this.likeRepository.getLikedPostIds(currentUserId, postIds);
    const bookmarkedSet = await this.bookmarkRepository.getBookmarkedPostIds(currentUserId, postIds);

    const formattedPosts = posts.map((p) => ({
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

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      followerCount,
      followingCount,
      isFollowing,
      isSelf,
      posts: formattedPosts,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<UserProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (dto.name !== undefined && dto.name.trim().length === 0) {
      throw new BadRequestError('Name cannot be empty');
    }
    if (dto.name && dto.name.trim().length > 50) {
      throw new BadRequestError('Name cannot exceed 50 characters');
    }
    if (dto.bio && dto.bio.trim().length > 300) {
      throw new BadRequestError('Bio cannot exceed 300 characters');
    }

    await this.userRepository.updateProfile(userId, {
      name: dto.name?.trim(),
      bio: dto.bio !== undefined ? dto.bio.trim() : undefined,
      avatarUrl: dto.avatarUrl,
    });

    return this.getUserProfile(userId, user.username);
  }

  async search(query: string, currentUserId: string): Promise<SearchResultsResponse> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { users: [], posts: [] };
    }

    // Clean query (e.g. remove leading hashtag if searching hashtag or keep as query)
    const cleanUserQuery = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;

    const [matchedUsers, matchedPosts] = await Promise.all([
      cleanUserQuery ? this.userRepository.searchUsers(cleanUserQuery, 8) : [],
      this.postRepository.searchPosts(trimmed, 15),
    ]);

    const formattedUsers: SuggestedUserResponse[] = await Promise.all(
      matchedUsers.map(async (u) => {
        const count = await this.followRepository.countFollowers(u.id);
        return {
          id: u.id,
          name: u.name,
          username: u.username,
          bio: u.bio,
          avatarUrl: u.avatarUrl,
          followerCount: count,
        };
      })
    );

    const postIds = matchedPosts.map((p) => p.id);
    const [likedSet, bookmarkedSet] = await Promise.all([
      this.likeRepository.getLikedPostIds(currentUserId, postIds),
      this.bookmarkRepository.getBookmarkedPostIds(currentUserId, postIds),
    ]);

    const formattedPosts = matchedPosts.map((p) => ({
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

    return {
      users: formattedUsers,
      posts: formattedPosts,
    };
  }

  async getSuggestedUsers(currentUserId: string): Promise<SuggestedUserResponse[]> {
    const users = await this.userRepository.getSuggestedUsers(currentUserId, 5);

    const suggested = await Promise.all(
      users.map(async (u) => {
        const count = await this.followRepository.countFollowers(u.id);
        return {
          id: u.id,
          name: u.name,
          username: u.username,
          bio: u.bio,
          avatarUrl: u.avatarUrl,
          followerCount: count,
        };
      })
    );

    return suggested;
  }
}
