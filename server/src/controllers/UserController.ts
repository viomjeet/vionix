import { Response, NextFunction } from 'express';
import { UserService } from '../services/UserService.js';
import { FollowService } from '../services/FollowService.js';
import { AuthenticatedRequest } from '../types/express.types.js';
import {
  UserProfileResponse,
  SuggestedUserResponse,
  UpdateProfileDTO,
  SearchResultsResponse,
} from '../types/user.types.js';
import { ApiResponse, ApiMessageResponse } from '../types/api.types.js';
import { UnauthorizedError } from '../utils/errors.js';

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService
  ) {}

  getUserProfile = async (
    req: AuthenticatedRequest<{ username: string }>,
    res: Response<ApiResponse<UserProfileResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { username } = req.params;
      const profile = await this.userService.getUserProfile(
        req.user.userId,
        username
      );

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  getSuggestedUsers = async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<SuggestedUserResponse[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const users = await this.userService.getSuggestedUsers(req.user.userId);

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  followUser = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response<ApiMessageResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      await this.followService.followUser(req.user.userId, id);

      res.status(200).json({
        success: true,
        message: 'User followed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  unfollowUser = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response<ApiMessageResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      await this.followService.unfollowUser(req.user.userId, id);

      res.status(200).json({
        success: true,
        message: 'User unfollowed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: AuthenticatedRequest<Record<string, never>, unknown, UpdateProfileDTO>,
    res: Response<ApiResponse<UserProfileResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const profile = await this.userService.updateProfile(req.user.userId, req.body);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  search = async (
    req: AuthenticatedRequest<Record<string, never>, unknown, unknown, { q?: string }>,
    res: Response<ApiResponse<SearchResultsResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const query = (req.query.q as string) || '';
      const results = await this.userService.search(query, req.user.userId);
      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  };
}
