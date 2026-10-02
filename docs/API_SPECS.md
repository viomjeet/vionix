# REST API Specifications

Base URL: `http://localhost:5000/api`

All API endpoints return JSON. Protected endpoints require the `Authorization` header with a Bearer token:
```http
Authorization: Bearer <jwt_token>
```

Standard Response Format:
```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Error description"
}
```

---

## 1. Authentication Endpoints

### 1.1 Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "Alex Johnson",
    "username": "alexj",
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Validation**:
  - `name`: string, min 2 chars, required
  - `username`: alphanumeric/underscore, 3-30 chars, unique, required
  - `email`: valid email format, unique, required
  - `password`: min 6 chars, required
- **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully. Please proceed to login."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure.
  - `409 Conflict`: Username or email already registered.

---

### 1.2 Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "identifier": "alexj", // Or "alex@example.com"
    "password": "Password123!"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "cm4abc123",
        "name": "Alex Johnson",
        "username": "alexj",
        "email": "alex@example.com",
        "bio": "Software engineer and tech enthusiast",
        "createdAt": "2026-10-02T10:00:00.000Z"
      }
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing identifier or password.
  - `401 Unauthorized`: Invalid credentials.

---

### 1.3 Google OAuth Login
- **URL**: `/auth/google`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "credential": "eyJhbGciOiJSUzI1NiIs..." // Google ID Token
  }
  ```
  *(Or for developer testing: `{ "email": "user@gmail.com", "name": "User", "googleId": "google_123" }`)*
- **Description**: Verifies Google ID token, links existing accounts with matching email or registers a new user with a generated unique username. Returns standard JWT token and user profile.
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "cm4abc123",
        "name": "Priya Sharma",
        "username": "priyasharma",
        "email": "priya.sharma@example.com",
        "bio": null,
        "avatarUrl": "https://lh3.googleusercontent.com/a/...",
        "createdAt": "2026-10-02T10:00:00.000Z"
      }
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid or expired Google credential.

---

### 1.3 Forgot Password
- **URL**: `/auth/forgot-password`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "alex@example.com"
  }
  ```
- **Action**: Generates a cryptographic token with a 1-hour expiration and logs a mock reset link to the server console:
  `http://localhost:5173/reset-password?token=<token>`
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "If that email exists in our records, a password reset link has been dispatched."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid email format.

---

### 1.4 Reset Password
- **URL**: `/auth/reset-password`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "token": "a1b2c3d4e5f6...",
    "newPassword": "NewSecurePassword123!"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Password has been successfully updated. Please login with your new credentials."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing token, password too short, or expired/invalid token.

---

### 1.5 Get Current User (Session Verification)
- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer <token>`)
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "cm4abc123",
      "name": "Alex Johnson",
      "username": "alexj",
      "email": "alex@example.com",
      "bio": "Software engineer and tech enthusiast",
      "createdAt": "2026-10-02T10:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token.

---

## 2. Posts Endpoints

### 2.1 Create Post
- **URL**: `/posts`
- **Method**: `POST`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "content": "Exploring TypeScript and React architectural patterns today!",
    "imageUrl": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" // Optional
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "id": "cm4post123",
      "content": "Exploring TypeScript and React architectural patterns today!",
      "imageUrl": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      "createdAt": "2026-10-02T12:00:00.000Z",
      "author": {
        "id": "cm4abc123",
        "name": "Alex Johnson",
        "username": "alexj"
      },
      "likeCount": 0,
      "commentCount": 0,
      "isLiked": false
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing or empty content.
  - `401 Unauthorized`: Not authenticated.

---

### 2.2 Get Home Feed
- **URL**: `/posts/feed`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Returns posts created by the current user and users they follow, ordered newest first.
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cm4post123",
        "content": "Exploring TypeScript and React architectural patterns today!",
        "imageUrl": null,
        "createdAt": "2026-10-02T12:00:00.000Z",
        "author": {
          "id": "cm4abc123",
          "name": "Alex Johnson",
          "username": "alexj"
        },
        "likeCount": 5,
        "commentCount": 2,
        "isLiked": true
      }
    ]
  }
  ```

---

### 2.3 Get Explore Feed
- **URL**: `/posts/explore`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Returns all platform posts ordered newest first.
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cm4post999",
        "content": "Hello community!",
        "imageUrl": null,
        "createdAt": "2026-10-02T11:45:00.000Z",
        "author": {
          "id": "cm4xyz789",
          "name": "Sarah Connor",
          "username": "sconnor"
        },
        "likeCount": 14,
        "commentCount": 3,
        "isLiked": false
      }
    ]
  }
  ```

---

### 2.4 Delete Post
- **URL**: `/posts/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Deletes a post. Only the post author can delete it.
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Post successfully deleted"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Authenticated user is not the post author.
  - `404 Not Found`: Post does not exist.

---

## 3. Likes Endpoints

### 3.1 Toggle / Add Like
- **URL**: `/posts/:id/like`
- **Method**: `POST`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Adds a like to the post. Idempotent or toggle behavior.
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "isLiked": true,
      "likeCount": 6
    }
  }
  ```

---

### 3.2 Remove Like
- **URL**: `/posts/:id/like`
- **Method**: `DELETE`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Removes the like on the post.
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "isLiked": false,
      "likeCount": 5
    }
  }
  ```

---

## 4. Comments Endpoints

### 4.1 Add Comment
- **URL**: `/posts/:id/comments`
- **Method**: `POST`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "content": "Great architectural design!"
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "id": "cm4comment456",
      "content": "Great architectural design!",
      "createdAt": "2026-10-02T12:05:00.000Z",
      "user": {
        "id": "cm4abc123",
        "name": "Alex Johnson",
        "username": "alexj"
      }
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Comment content empty.
  - `404 Not Found`: Post does not exist.

---

### 4.2 Get Post Comments
- **URL**: `/posts/:id/comments`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer <token>`)
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cm4comment456",
        "content": "Great architectural design!",
        "createdAt": "2026-10-02T12:05:00.000Z",
        "user": {
          "id": "cm4abc123",
          "name": "Alex Johnson",
          "username": "alexj"
        }
      }
    ]
  }
  ```

---

## 5. Users & Follows Endpoints

### 5.1 Get User Profile
- **URL**: `/users/:username`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer <token>`)
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "id": "cm4xyz789",
      "name": "Sarah Connor",
      "username": "sconnor",
      "bio": "Building the future.",
      "createdAt": "2026-09-15T08:00:00.000Z",
      "followerCount": 42,
      "followingCount": 18,
      "isFollowing": false,
      "isSelf": false,
      "posts": [
        {
          "id": "cm4post999",
          "content": "Hello community!",
          "imageUrl": null,
          "createdAt": "2026-10-02T11:45:00.000Z",
          "likeCount": 14,
          "commentCount": 3,
          "isLiked": false
        }
      ]
    }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: User not found.

---

### 5.2 Get Suggested Users
- **URL**: `/users/suggested`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Returns up to 5 suggested users whom the current user is not currently following.
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cm4xyz789",
        "name": "Sarah Connor",
        "username": "sconnor",
        "bio": "Building the future.",
        "followerCount": 42
      }
    ]
  }
  ```

---

### 5.3 Follow User
- **URL**: `/users/:id/follow`
- **Method**: `POST`
- **Auth Required**: Yes (`Bearer <token>`)
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "User followed successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: User attempted to follow themselves.
  - `409 Conflict`: Already following this user.
  - `404 Not Found`: Target user not found.

---

### 5.4 Unfollow User
- **URL**: `/users/:id/follow`
- **Method**: `DELETE`
- **Auth Required**: Yes (`Bearer <token>`)
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "User unfollowed successfully"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Target user was not followed or attempting to unfollow oneself.
