import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';
import { AuthenticatedRequest } from '../types/express.types.js';
import {
  RegisterDTO,
  LoginDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  GoogleAuthDTO,
  AuthSuccessData,
  AuthUserResponse,
} from '../types/auth.types.js';
import { ApiResponse, ApiMessageResponse } from '../types/api.types.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (
    req: Request<Record<string, never>, unknown, RegisterDTO>,
    res: Response<ApiMessageResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please proceed to login.',
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request<Record<string, never>, unknown, LoginDTO>,
    res: Response<ApiResponse<AuthSuccessData>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.authService.login(req.body);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (
    req: Request<Record<string, never>, unknown, GoogleAuthDTO>,
    res: Response<ApiResponse<AuthSuccessData>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.authService.googleLogin(req.body);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (
    req: Request<Record<string, never>, unknown, ForgotPasswordDTO>,
    res: Response<ApiMessageResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const message = await this.authService.forgotPassword(req.body);
      res.status(200).json({
        success: true,
        message,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request<Record<string, never>, unknown, ResetPasswordDTO>,
    res: Response<ApiMessageResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const message = await this.authService.resetPassword(req.body);
      res.status(200).json({
        success: true,
        message,
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<AuthUserResponse>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const user = await this.authService.getMe(req.user.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
