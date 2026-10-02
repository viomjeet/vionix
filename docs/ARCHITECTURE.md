# System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

The Social Media Application is built as a decoupled full-stack architecture comprising a React Single Page Application (SPA) frontend and a Node.js/Express REST API backend, backed by an embedded SQLite database managed via Prisma ORM.

```
+-------------------------------------------------------------+
|                        Client Layer                         |
|  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons |
+-------------------------------------------------------------+
                              |
                     HTTP / JSON (REST)
                     Bearer JWT in Header
                              v
+-------------------------------------------------------------+
|                        Server Layer                         |
|     Node.js + Express + TypeScript (Strict Type Safety)     |
|                                                             |
|  +-------------------------------------------------------+  |
|  |                Express Routing & Middleware           |  |
|  |   - JSON Parser, CORS, JWT Auth & Error Handling      |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  |                   Controller Layer                    |  |
|  |   - AuthController, PostController, UserController    |  |
|  |   - CommentController, LikeController                |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  |                    Service Layer                      |  |
|  |   - Business validation, hashing, authorization       |  |
|  |   - AuthService, PostService, UserService, etc.       |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  |                   Repository Layer                    |  |
|  |   - Abstracted data access via Prisma Client          |  |
|  |   - UserRepository, PostRepository, FollowRepo, etc.  |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
                              |
                      Prisma ORM Client
                              v
+-------------------------------------------------------------+
|                       Database Layer                        |
|       SQLite (Embedded file: ./dev.db - Zero External DB)   |
+-------------------------------------------------------------+
```

---

## 2. Backend Architecture: Controller-Service-Repository (CSR)

The backend follows strict separation of concerns with manual dependency injection:

```
[ Incoming HTTP Request ]
          |
          v
[ Route Definition ]  --> Mounts endpoints and middlewares
          |
          v
[ Middleware Pipeline ]
   - cors(), express.json()
   - authMiddleware (verifies JWT, attaches req.user: JWTPayload)
          |
          v
[ Controller Layer ]
   - Extracts params, query, and validated body
   - Calls corresponding Service method
   - Returns standard ApiResponse<T> envelope: { success: true, data: T }
          |
          v
[ Service Layer ]
   - Enforces business logic & invariants:
       * Passwords hashed via bcryptjs before storage
       * User cannot follow themselves
       * User can only delete their own posts
       * Home feed aggregation logic
   - Calls Repository layer for persistence
          |
          v
[ Repository Layer ]
   - Translates domain queries into Prisma ORM queries
   - Queries `prisma.user`, `prisma.post`, `prisma.follow`, etc.
   - Converts results into typed DTOs, stripping sensitive properties
          |
          v
[ Database (SQLite dev.db) ]
```

### Manual Dependency Injection Diagram
At `server/src/server.ts`, dependencies are constructed from the bottom up:
```typescript
const prisma = new PrismaClient();

// Repositories
const userRepository = new UserRepository(prisma);
const postRepository = new PostRepository(prisma);
const followRepository = new FollowRepository(prisma);
const likeRepository = new LikeRepository(prisma);
const commentRepository = new CommentRepository(prisma);

// Services
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository, followRepository, postRepository);
const postService = new PostService(postRepository, followRepository);
const followService = new FollowService(followRepository, userRepository);
const likeService = new LikeService(likeRepository, postRepository);
const commentService = new CommentService(commentRepository, postRepository);

// Controllers
const authController = new AuthController(authService);
const userController = new UserController(userService);
const postController = new PostController(postService);
const likeController = new LikeController(likeService);
const commentController = new CommentController(commentService);
```

---

## 3. Database Design & Prisma Schema Relations

The data layer uses SQLite with file-based persistence (`file:./dev.db`).

### Entity Relationship Model

```
+-------------------------------------------------------------+
|                           User                              |
|-------------------------------------------------------------|
| id: String (cuid) [PK]                                      |
| name: String                                                |
| username: String [Unique]                                   |
| email: String [Unique]                                      |
| passwordHash: String                                        |
| bio: String?                                                |
| resetPasswordToken: String?                                 |
| resetPasswordExpires: DateTime?                             |
| createdAt: DateTime                                         |
| updatedAt: DateTime                                         |
+-------------------------------------------------------------+
     | 1            | 1            | 1          | 1        | 1
     |              |              |            |          |
     | *            | *            | *          | *        | *
+---------+    +----------+   +----------+  +--------+  +-----------+
|  Post   |    | Follower |   |Following |  |  Like  |  |  Comment  |
+---------+    +----------+   +----------+  +--------+  +-----------+
```

### Core Relations and Constraints:
1. **User <-> Post (1-to-many)**:
   - `authorId` references `User.id` with cascade deletion.
2. **User <-> Follow (many-to-many self-relation)**:
   - `followerId` references `User.id` (the person doing the following).
   - `followingId` references `User.id` (the person being followed).
   - Compound unique index: `@@unique([followerId, followingId])` ensures a user cannot follow another multiple times.
   - Validation ensures `followerId !== followingId`.
3. **User & Post <-> Like (many-to-many join)**:
   - `userId` references `User.id`.
   - `postId` references `Post.id` with cascade deletion.
   - Compound unique index: `@@unique([userId, postId])` prevents duplicate likes.
4. **User & Post <-> Comment (1-to-many)**:
   - `userId` references `User.id`.
   - `postId` references `Post.id` with cascade deletion.
   - `content` stores the text comment.

---

## 4. Authentication & Security Flows

### 1. Registration Flow
```
User submits Name, Username, Email, Password
  ↓
Backend validates fields, email format, and password length
  ↓
Backend checks if username or email already exists (returns 409 if taken)
  ↓
Password hashed with bcryptjs (work factor 10)
  ↓
User created in SQLite
  ↓
Backend returns { success: true, message: "Registration successful" }
  ↓
Client redirects user to /login (DO NOT auto-login)
```

### 2. Login Flow
```
User submits Email/Username and Password
  ↓
Backend searches user by email or username
  ↓
Bcrypt compares password against passwordHash
  ↓
If valid, backend generates JWT token containing { userId, username, email }
  ↓
Backend returns { success: true, data: { token, user: { id, name, username, email, bio } } }
  ↓
Client stores token in localStorage and sets AuthContext state
  ↓
Client redirects user to / (Home Feed)
```

### 3. Password Reset Flow (Mock Email Console Log)
```
User visits /forgot-password and enters Email
  ↓
Backend checks if user exists
  ↓
Backend generates cryptographically secure reset token (crypto.randomBytes)
  ↓
Backend sets resetPasswordToken and resetPasswordExpires (e.g. 1 hour) in DB
  ↓
Backend logs Mock Reset Link in Server Console:
  ======================================================
  [PASSWORD RESET MOCK EMAIL]
  Recipient: user@example.com
  Reset Link: http://localhost:5173/reset-password?token=xxxx
  ======================================================
  ↓
Backend responds with { success: true, message: "Password reset link generated" }
  ↓
User navigates to /reset-password?token=xxxx
  ↓
User enters new password
  ↓
Backend verifies token validity and expiration
  ↓
Backend hashes new password, updates DB, clears reset token
  ↓
Client redirects user to /login
```

### 4. Session Restoration & Route Protection
- On app launch / page refresh, the frontend inspects `localStorage.getItem('token')`.
- If present, it sends `GET /api/auth/me` with Bearer token.
- If verified, session is restored seamlessly; if expired or invalid, storage is cleared and user is redirected to `/login`.
- If an unauthenticated user navigates to `/`, `/explore`, `/profile/:username`, the `ProtectedRoute` component redirects immediately to `/login`.

---

## 5. Feed Mechanics & Business Logic

### Home Feed (`GET /api/posts/feed`)
The Home Feed displays content curated for the logged-in user:
1. Identify all `followingId`s where `followerId === currentUserId`.
2. Include `currentUserId` in the author ID list so users also see their own updates.
3. Query `Post` records where `authorId IN (currentUserId, ...followingIds)`.
4. Sort by `createdAt DESC`.
5. For each post, compute:
   - `likeCount`: count of associated likes.
   - `commentCount`: count of associated comments.
   - `isLiked`: boolean whether `currentUserId` has an active like record on the post.

### Explore Feed (`GET /api/posts/explore`)
1. Query all posts across the platform without author restrictions.
2. Sort by `createdAt DESC`.
3. Compute `likeCount`, `commentCount`, and `isLiked` for the requesting user.

---

## 6. Frontend Architecture

### Technology Stack
- **React 18 + Vite**: Lightning-fast compilation and HMR.
- **TypeScript**: Strict type checking with matching API DTO models.
- **Tailwind CSS**: Utility-first CSS configured for a calm, professional palette.
- **Lucide React**: Clean, accessible iconography.
- **React Router v6**: Client-side routing with nested layout routes and protected route wrappers.

### Directory Structure & Responsibilities
```
client/src/
├── components/          # Reusable UI building blocks
│   ├── AppLayout.tsx    # 3-column desktop / 1-column mobile wrapper
│   ├── Sidebar.tsx      # Desktop left-hand navigation
│   ├── MobileNav.tsx    # Mobile bottom navigation bar
│   ├── RightSidebar.tsx # Suggested users to follow
│   ├── Navbar.tsx       # Header with brand and user menu
│   ├── PostCard.tsx     # Post content, image, like, comment, and delete
│   ├── CreatePost.tsx   # Post composition input with loading state
│   ├── CommentSection.tsx # Comment list and submission box
│   ├── UserCard.tsx     # User preview with follow/unfollow button
│   ├── ProtectedRoute.tsx # Auth guard redirecting to /login
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
├── context/
│   └── AuthContext.tsx  # Centralized authentication & token state
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── HomePage.tsx     # Home feed view
│   ├── ExplorePage.tsx  # Global explore feed view
│   └── ProfilePage.tsx  # User profile view with stats and posts
├── services/
│   ├── api.ts           # Centralized fetch wrapper with auth header injection
│   ├── auth.service.ts
│   ├── post.service.ts
│   └── user.service.ts
├── types/               # Strict frontend interfaces and response models
├── App.tsx              # Route registration
└── main.tsx             # Root bootstrap
```

### Visual Palette
- **Background**: Soft off-white / light slate (`#f8fafc` / `bg-slate-50`)
- **Cards & Surfaces**: Clean white (`#ffffff` / `bg-white`) with subtle border (`#e2e8f0` / `border-slate-200`) and slight shadow (`shadow-sm`)
- **Primary Accent**: Soft muted blue (`#0284c7` / `text-sky-600` / `bg-sky-600`)
- **Text**: Deep dark slate (`#0f172a` / `text-slate-900`) and muted slate (`#64748b` / `text-slate-500`)
