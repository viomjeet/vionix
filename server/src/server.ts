import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import { UserRepository } from './repositories/UserRepository.js';
import { PostRepository } from './repositories/PostRepository.js';
import { FollowRepository } from './repositories/FollowRepository.js';
import { LikeRepository } from './repositories/LikeRepository.js';
import { CommentRepository } from './repositories/CommentRepository.js';
import { BookmarkRepository } from './repositories/BookmarkRepository.js';

import { AuthService } from './services/AuthService.js';
import { UserService } from './services/UserService.js';
import { PostService } from './services/PostService.js';
import { LikeService } from './services/LikeService.js';
import { CommentService } from './services/CommentService.js';
import { FollowService } from './services/FollowService.js';

import { AuthController } from './controllers/AuthController.js';
import { UserController } from './controllers/UserController.js';
import { PostController } from './controllers/PostController.js';
import { LikeController } from './controllers/LikeController.js';
import { CommentController } from './controllers/CommentController.js';

import { createAuthRouter } from './routes/auth.routes.js';
import { createPostRouter } from './routes/post.routes.js';
import { createUserRouter } from './routes/user.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or any localhost/127.0.0.1 port
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Database Client
const prisma = new PrismaClient();

// Dependency Injection: Repositories
const userRepository = new UserRepository(prisma);
const postRepository = new PostRepository(prisma);
const followRepository = new FollowRepository(prisma);
const likeRepository = new LikeRepository(prisma);
const commentRepository = new CommentRepository(prisma);
const bookmarkRepository = new BookmarkRepository(prisma);

// Dependency Injection: Services
const authService = new AuthService(userRepository);
const followService = new FollowService(followRepository, userRepository);
const likeService = new LikeService(likeRepository, postRepository);
const commentService = new CommentService(commentRepository, postRepository);
const postService = new PostService(
  postRepository,
  followRepository,
  likeRepository,
  bookmarkRepository
);
const userService = new UserService(
  userRepository,
  followRepository,
  postRepository,
  likeRepository,
  bookmarkRepository
);

// Dependency Injection: Controllers
const authController = new AuthController(authService);
const postController = new PostController(postService);
const likeController = new LikeController(likeService);
const commentController = new CommentController(commentService);
const userController = new UserController(userService, followService);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', createAuthRouter(authController));
app.use('/api/posts', createPostRouter(postController, likeController, commentController));
app.use('/api/users', createUserRouter(userController));

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

export { app, prisma };
