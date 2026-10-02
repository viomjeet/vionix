import { Response, NextFunction } from 'express';
import { CommentService } from '../services/CommentService.js';
import { AuthenticatedRequest } from '../types/express.types.js';
import { CreateCommentDTO, CommentResponse } from '../types/comment.types.js';
import { ApiResponse } from '../types/api.types.js';
import { UnauthorizedError } from '../utils/errors.js';

export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  addComment = async (
    req: AuthenticatedRequest<{ id: string }, unknown, CreateCommentDTO>,
    res: Response<ApiResponse<CommentResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      const comment = await this.commentService.addComment(
        req.user.userId,
        id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  getPostComments = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response<ApiResponse<CommentResponse[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const comments = await this.commentService.getPostComments(id);

      res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  };
}
