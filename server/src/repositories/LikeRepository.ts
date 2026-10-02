import { PrismaClient, Like } from '@prisma/client';

export class LikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createLike(userId: string, postId: string): Promise<Like> {
    return this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  }

  async deleteLike(userId: string, postId: string): Promise<Like> {
    return this.prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async findLike(userId: string, postId: string): Promise<Like | null> {
    return this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async countLikes(postId: string): Promise<number> {
    return this.prisma.like.count({
      where: { postId },
    });
  }

  async isLikedByUser(userId: string, postId: string): Promise<boolean> {
    const like = await this.findLike(userId, postId);
    return like !== null;
  }

  async getLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
    if (postIds.length === 0) return new Set<string>();

    const likes = await this.prisma.like.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });

    return new Set(likes.map((l) => l.postId));
  }
}
