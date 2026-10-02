import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from '../repositories/UserRepository.js';
import {
  RegisterDTO,
  LoginDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  GoogleAuthDTO,
  AuthSuccessData,
  AuthUserResponse,
  JWTPayload,
} from '../types/auth.types.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(dto: RegisterDTO): Promise<AuthUserResponse> {
    if (!dto.name || dto.name.trim().length < 2) {
      throw new BadRequestError('Name must be at least 2 characters long');
    }

    if (!dto.username || !/^[a-zA-Z0-9_]{3,30}$/.test(dto.username.trim())) {
      throw new BadRequestError(
        'Username must be between 3 and 30 characters and contain only letters, numbers, and underscores'
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dto.email || !emailRegex.test(dto.email.trim())) {
      throw new BadRequestError('Please provide a valid email address');
    }

    if (!dto.password || dto.password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters long');
    }

    const cleanUsername = dto.username.toLowerCase().trim();
    const cleanEmail = dto.email.toLowerCase().trim();

    const existingEmail = await this.userRepository.findByEmail(cleanEmail);
    if (existingEmail) {
      throw new ConflictError('An account with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(cleanUsername);
    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser = await this.userRepository.createUser({
      name: dto.name,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
    });

    return {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      bio: newUser.bio,
      createdAt: newUser.createdAt,
    };
  }

  async login(dto: LoginDTO): Promise<AuthSuccessData> {
    if (!dto.identifier || !dto.password) {
      throw new BadRequestError('Email or username and password are required');
    }

    const user = await this.userRepository.findByIdentifier(dto.identifier);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError(
        'This account was registered using Google. Please sign in with Google.'
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const secret = process.env.JWT_SECRET || 'social_media_app_jwt_super_secret_key_2026_xyz!';
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    };
  }

  private async generateUniqueUsername(email: string, name?: string): Promise<string> {
    const rawBase = (name || email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 18);
    const base = rawBase.length >= 3 ? rawBase : `user_${Date.now().toString().slice(-4)}`;

    let candidate = base;
    let counter = 1;
    while (await this.userRepository.findByUsername(candidate)) {
      candidate = `${base}_${counter}`;
      counter++;
    }
    return candidate;
  }

  async googleLogin(dto: GoogleAuthDTO): Promise<AuthSuccessData> {
    let email = dto.email;
    let name = dto.name;
    let googleId = dto.googleId;
    let avatarUrl = dto.avatarUrl;

    if (dto.credential) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      try {
        if (clientId && clientId !== 'your-google-client-id') {
          const client = new OAuth2Client(clientId);
          const ticket = await client.verifyIdToken({
            idToken: dto.credential,
            audience: clientId,
          });
          const payload = ticket.getPayload();
          if (payload && payload.email) {
            email = payload.email;
            name = payload.name || payload.email.split('@')[0];
            googleId = payload.sub;
            avatarUrl = payload.picture;
          }
        } else {
          // If developer hasn't configured clientId yet, decode JWT payload for test/demo credentials
          const decoded = jwt.decode(dto.credential) as jwt.JwtPayload | null;
          if (decoded && decoded.email) {
            email = decoded.email;
            name = decoded.name || decoded.email.split('@')[0];
            googleId = decoded.sub || `google_${Date.now()}`;
            avatarUrl = decoded.picture;
          }
        }
      } catch (err) {
        console.error('Google token verification error:', err);
        throw new BadRequestError('Invalid Google credential token');
      }
    }

    if (!email || !googleId) {
      throw new BadRequestError('Could not retrieve required account information from Google');
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user exists by googleId
    let user = await this.userRepository.findByGoogleId(googleId);

    // 2. Check if user exists by email (link Google account)
    if (!user) {
      const existingByEmail = await this.userRepository.findByEmail(cleanEmail);
      if (existingByEmail) {
        user = await this.userRepository.linkGoogleAccount(
          existingByEmail.id,
          googleId,
          avatarUrl
        );
      }
    }

    // 3. New user registration via Google
    if (!user) {
      const uniqueUsername = await this.generateUniqueUsername(cleanEmail, name);
      user = await this.userRepository.createGoogleUser({
        name: name?.trim() || cleanEmail.split('@')[0],
        username: uniqueUsername,
        email: cleanEmail,
        googleId,
        avatarUrl,
      });
    }

    const secret = process.env.JWT_SECRET || 'social_media_app_jwt_super_secret_key_2026_xyz!';
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDTO): Promise<string> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dto.email || !emailRegex.test(dto.email.trim())) {
      throw new BadRequestError('Please provide a valid email address');
    }

    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(cleanEmail);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.userRepository.updateResetToken(user.id, resetToken, resetExpires);

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

      console.log('\n======================================================');
      console.log('[PASSWORD RESET MOCK EMAIL]');
      console.log(`Recipient: ${user.email}`);
      console.log('Password reset link:');
      console.log(resetLink);
      console.log('======================================================\n');
    }

    return 'If that email exists in our records, a password reset link has been dispatched.';
  }

  async resetPassword(dto: ResetPasswordDTO): Promise<string> {
    if (!dto.token || dto.token.trim().length === 0) {
      throw new BadRequestError('Password reset token is required');
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestError('New password must be at least 6 characters long');
    }

    const user = await this.userRepository.findByResetToken(dto.token.trim());
    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.userRepository.updatePassword(user.id, passwordHash);

    return 'Password has been successfully updated. Please login with your new credentials.';
  }

  async getMe(userId: string): Promise<AuthUserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }
}
