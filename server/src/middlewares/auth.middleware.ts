import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/express.types.js';
import { UnauthorizedError } from '../utils/errors.js';

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    const secret = process.env.JWT_SECRET || 'social_media_app_jwt_super_secret_key_2026_xyz!';

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      throw new UnauthorizedError('Invalid authentication token payload');
    }

    req.user = {
      userId: String(decoded.userId),
      username: String(decoded.username),
      email: String(decoded.email),
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    } else {
      next(error);
    }
  }
};
