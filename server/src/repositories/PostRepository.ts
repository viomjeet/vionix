import { PrismaClient, Post } from '@prisma/client';

export type PostWithRelations = Post & {
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
};

export class PostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPost(data: {
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    authorId: string;
  }): Promise<PostWithRelations> {
    return this.prisma.post.create({
      data: {
        content: data.content.trim(),
        imageUrl: data.imageUrl ? data.imageUrl.trim() : null,
        videoUrl: data.videoUrl ? data.videoUrl.trim() : null,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<PostWithRelations | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async deletePost(id: string): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }

  async findFeedPosts(authorIds: string[]): Promise<PostWithRelations[]> {
    return this.prisma.post.findMany({
      where: {
        authorId: { in: authorIds },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async findExplorePosts(): Promise<PostWithRelations[]> {
    return this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async findByAuthorId(authorId: string): Promise<PostWithRelations[]> {
    return this.prisma.post.findMany({
      where: { authorId },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async searchPosts(query: string, limit: number = 10): Promise<PostWithRelations[]> {
    return this.prisma.post.findMany({
      where: {
        content: {
          contains: query,
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async countByAuthorId(authorId: string): Promise<number> {
    return this.prisma.post.count({
      where: { authorId },
    });
  }
}
