import { PrismaClient, Bookmark } from '@prisma/client';
import { PostWithRelations } from './PostRepository.js';

export class BookmarkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createBookmark(userId: string, postId: string): Promise<Bookmark> {
    return this.prisma.bookmark.create({
      data: {
        userId,
        postId,
      },
    });
  }

  async deleteBookmark(userId: string, postId: string): Promise<Bookmark> {
    return this.prisma.bookmark.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async findBookmark(userId: string, postId: string): Promise<Bookmark | null> {
    return this.prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async isBookmarkedByUser(userId: string, postId: string): Promise<boolean> {
    const bookmark = await this.findBookmark(userId, postId);
    return bookmark !== null;
  }

  async getBookmarkedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
    if (postIds.length === 0) return new Set<string>();

    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });

    return new Set(bookmarks.map((b) => b.postId));
  }

  async findBookmarkedPosts(userId: string): Promise<PostWithRelations[]> {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
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
        },
      },
    });

    return bookmarks.map((b) => b.post);
  }
}
