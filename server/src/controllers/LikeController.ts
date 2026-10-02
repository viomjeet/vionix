import { Response, NextFunction } from 'express';
import { LikeService } from '../services/LikeService.js';
import { AuthenticatedRequest } from '../types/express.types.js';
import { LikeToggleResponse } from '../types/post.types.js';
import { ApiResponse } from '../types/api.types.js';
import { UnauthorizedError } from '../utils/errors.js';

export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  toggleLike = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response<ApiResponse<LikeToggleResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      const result = await this.likeService.toggleLike(req.user.userId, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  unlikePost = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response<ApiResponse<LikeToggleResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      const result = await this.likeService.unlikePost(req.user.userId, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
