import { PrismaClient, User } from '@prisma/client';

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const cleanId = identifier.toLowerCase().trim();
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId },
          { username: cleanId },
        ],
      },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async createUser(data: {
    name: string;
    username: string;
    email: string;
    passwordHash?: string | null;
    bio?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: data.name.trim(),
        username: data.username.toLowerCase().trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash || null,
        bio: data.bio?.trim() || null,
      },
    });
  }

  async createGoogleUser(data: {
    name: string;
    username: string;
    email: string;
    googleId: string;
    avatarUrl?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: data.name.trim(),
        username: data.username.toLowerCase().trim(),
        email: data.email.toLowerCase().trim(),
        googleId: data.googleId,
        avatarUrl: data.avatarUrl || null,
      },
    });
  }

  async linkGoogleAccount(
    userId: string,
    googleId: string,
    avatarUrl?: string
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        avatarUrl: avatarUrl || undefined,
      },
    });
  }

  async updateResetToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  async getSuggestedUsers(currentUserId: string, limit: number = 5): Promise<User[]> {
    // Find users who are NOT the current user and not already followed by current user
    const following = await this.prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });

    const excludedIds = [currentUserId, ...following.map((f) => f.followingId)];

    return this.prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; bio?: string; avatarUrl?: string }
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        bio: data.bio !== undefined ? data.bio.trim() : undefined,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl.trim() : undefined,
      },
    });
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    const cleanQuery = query.trim().replace(/^@/, '');
    if (!cleanQuery) return [];

    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: cleanQuery } },
          { name: { contains: cleanQuery } },
        ],
      },
      take: limit,
    });
  }
}
