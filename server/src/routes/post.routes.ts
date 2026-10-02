import { Router } from 'express';
import { PostController } from '../controllers/PostController.js';
import { LikeController } from '../controllers/LikeController.js';
import { CommentController } from '../controllers/CommentController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const createPostRouter = (
  postController: PostController,
  likeController: LikeController,
  commentController: CommentController
): Router => {
  const router = Router();

  // All post routes require authentication
  router.use(authMiddleware);

  // Feed routes must precede parameterised /:id routes
  router.post('/', postController.createPost);
  router.get('/feed', postController.getHomeFeed);
  router.get('/explore', postController.getExploreFeed);
  router.get('/bookmarks', postController.getBookmarkedPosts);
  router.delete('/:id', postController.deletePost);

  // Bookmarks
  router.post('/:id/bookmark', postController.toggleBookmark);

  // Likes
  router.post('/:id/like', likeController.toggleLike);
  router.delete('/:id/like', likeController.unlikePost);

  // Comments
  router.post('/:id/comments', commentController.addComment);
  router.get('/:id/comments', commentController.getPostComments);

  return router;
};
