import { Response, NextFunction } from 'express';
import { PostService } from '../services/PostService.js';
import { AuthenticatedRequest } from '../types/express.types.js';
import { BookmarkToggleResponse, CreatePostDTO, PostResponse } from '../types/post.types.js';
import { ApiResponse, ApiMessageResponse } from '../types/api.types.js';
import { UnauthorizedError } from '../utils/errors.js';

export class PostController {
  constructor(private readonly postService: PostService) {}

  createPost = async (
    req: AuthenticatedRequest<Record<string, never>, unknown, CreatePostDTO>,
    res: Response<ApiResponse<PostResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const post = await this.postService.createPost(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  };

  getHomeFeed = async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<PostResponse[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const posts = await this.postService.getHomeFeed(req.user.userId);
      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  };

  getExploreFeed = async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<PostResponse[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const posts = await this.postService.getExploreFeed(req.user.userId);
      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  };

  getBookmarkedPosts = async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<PostResponse[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const posts = await this.postService.getBookmarkedPosts(req.user.userId);
      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleBookmark = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response<ApiResponse<BookmarkToggleResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      const result = await this.postService.toggleBookmark(req.user.userId, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deletePost = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response<ApiMessageResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      await this.postService.deletePost(req.user.userId, id);
      res.status(200).json({
        success: true,
        message: 'Post successfully deleted',
      });
    } catch (error) {
      next(error);
    }
  };
}
