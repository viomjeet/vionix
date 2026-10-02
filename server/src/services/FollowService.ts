import { FollowRepository } from '../repositories/FollowRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors.js';

export class FollowService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly userRepository: UserRepository
  ) {}

  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestError('You cannot follow yourself');
    }

    const targetUser = await this.userRepository.findById(followingId);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    const isAlreadyFollowing = await this.followRepository.isFollowing(
      followerId,
      followingId
    );
    if (isAlreadyFollowing) {
      throw new ConflictError('You are already following this user');
    }

    await this.followRepository.createFollow(followerId, followingId);
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestError('You cannot unfollow yourself');
    }

    const isFollowing = await this.followRepository.isFollowing(
      followerId,
      followingId
    );
    if (!isFollowing) {
      throw new BadRequestError('You are not following this user');
    }

    await this.followRepository.deleteFollow(followerId, followingId);
  }
}
