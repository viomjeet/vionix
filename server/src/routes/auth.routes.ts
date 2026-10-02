import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/google', authController.googleLogin);
  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password', authController.resetPassword);
  router.get('/me', authMiddleware, authController.getMe);

  return router;
};
