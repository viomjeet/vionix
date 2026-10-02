import { PrismaClient, Follow } from '@prisma/client';

export class FollowRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createFollow(followerId: string, followingId: string): Promise<Follow> {
    return this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async deleteFollow(followerId: string, followingId: string): Promise<Follow> {
    return this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async findFollow(followerId: string, followingId: string): Promise<Follow | null> {
    return this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async countFollowers(userId: string): Promise<number> {
    return this.prisma.follow.count({
      where: { followingId: userId },
    });
  }

  async countFollowing(userId: string): Promise<number> {
    return this.prisma.follow.count({
      where: { followerId: userId },
    });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.findFollow(followerId, followingId);
    return follow !== null;
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    const records = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    return records.map((r) => r.followingId);
  }
}
