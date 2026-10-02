# Project Guidelines & Coding Standards

## 1. Core Architecture Principles

### Controller-Service-Repository (CSR) Pattern
The backend is strictly divided into three distinct layers:
1. **Controller Layer (`server/src/controllers/`)**:
   - Handles HTTP requests and responses.
   - Extracts and validates parameters, query strings, and request bodies.
   - Delegates business logic to services.
   - Formats responses using standard API envelopes `{ success: true, data: ... }`.
   - **Never** perform database queries or raw Prisma calls in controllers.

2. **Service Layer (`server/src/services/`)**:
   - Encapsulates all domain and business logic (e.g., password hashing, feed filtering, follow rules, ownership verification).
   - Validates business constraints (e.g., cannot follow oneself, cannot delete another user's post).
   - Coordinates with repositories to persist or retrieve domain models.
   - **Never** interact directly with HTTP request/response objects in services.

3. **Repository Layer (`server/src/repositories/`)**:
   - Encapsulates all data access and database operations using Prisma ORM.
   - Provides clean domain-oriented methods (e.g., `findByUsername`, `findHomeFeed`, `createLike`).
   - Completely abstracts database access from services.

### Manual Dependency Injection
- Do not use magic reflection or global state singletons where dependencies are hidden.
- Repositories accept `PrismaClient` in their constructors.
- Services accept repository instances in their constructors.
- Controllers accept service instances in their constructors.
- Instances are composed at the application root (`server/src/server.ts`).

---

## 2. TypeScript Rules

- **Zero `any` Policy**:
  - The use of `any` is strictly prohibited throughout the entire codebase (`server` and `client`).
  - Use exact interfaces, typed DTOs, generics, union types, or `unknown` with type narrowing/type guards.
- **Strict Compilation**:
  - `"strict": true` must remain enabled in both `server/tsconfig.json` and `client/tsconfig.json`.
  - All properties must have explicit type annotations when not inferable.
- **Express Request Typing**:
  - Use custom typed interfaces extending `Request` (e.g., `AuthenticatedRequest` with `req.user: JWTPayload`).
  - Do not cast request parameters or bodies to `any`.

---

## 3. Security Standards

- **Password Hashing**: Passwords must always be hashed with `bcryptjs` using a salt work factor of 10+.
- **Zero Sensitive Data Exposure**:
  - Never return `passwordHash` or reset tokens in API responses.
  - Exclude sensitive fields at the repository or service layer before delivering responses.
- **Ownership Authorization**:
  - A user may only delete their own posts. Ownership must be verified against `req.user.userId`.
- **Self-Action Prevention**:
  - A user cannot follow themselves.
- **Data Integrity**:
  - Duplicate follows and likes are prevented at both the database level (unique compound indexes) and service level.
- **JWT Protection**:
  - Protected endpoints require Bearer JWT tokens in the `Authorization` header.
  - Token validity and expiration must be verified on every protected request.

---

## 4. API & Error Conventions

### Standard API Responses
- **Success Response**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "message": "Human-readable error description"
  }
  ```

### HTTP Status Codes
- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing or invalid authentication token.
- `403 Forbidden`: Authenticated user does not have permission (e.g., deleting another user's post).
- `404 Not Found`: Target resource does not exist.
- `409 Conflict`: Unique constraint violation (e.g., username or email already taken).
- `500 Internal Server Error`: Unhandled server exception.

---

## 5. Frontend Guidelines

- **Component Design**:
  - Build small, reusable, single-responsibility components (`client/src/components/`).
  - Use typed props with TypeScript interfaces for all components.
- **Styling**:
  - Strictly use Tailwind CSS classes following the sober, soft color scheme.
  - Avoid flashy gradients, loud neon colors, or overbearing shadows.
  - Use Lucide React icons.
- **State & API Handling**:
  - Centralize all API calls in `client/src/services/api.ts` and related service modules.
  - Keep loading, error, and empty states clear and accessible.
  - Provide immediate UI feedback (e.g., like count update, disabling submit buttons during requests).
