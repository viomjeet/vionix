import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const createUserRouter = (userController: UserController): Router => {
  const router = Router();

  // All user routes require authentication
  router.use(authMiddleware);

  // Specific routes must precede /:username
  router.get('/search', userController.search);
  router.put('/profile', userController.updateProfile);
  router.get('/suggested', userController.getSuggestedUsers);
  router.get('/:username', userController.getUserProfile);
  router.post('/:id/follow', userController.followUser);
  router.delete('/:id/follow', userController.unfollowUser);

  return router;
};
