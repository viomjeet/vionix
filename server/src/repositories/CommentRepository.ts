import { PrismaClient, Comment } from '@prisma/client';

export type CommentWithUser = Comment & {
  user: {
    id: string;
    name: string;
    username: string;
  };
};

export class CommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createComment(data: {
    content: string;
    userId: string;
    postId: string;
  }): Promise<CommentWithUser> {
    return this.prisma.comment.create({
      data: {
        content: data.content.trim(),
        userId: data.userId,
        postId: data.postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });
  }

  async findByPostId(postId: string): Promise<CommentWithUser[]> {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });
  }

  async countComments(postId: string): Promise<number> {
    return this.prisma.comment.count({
      where: { postId },
    });
  }
}
