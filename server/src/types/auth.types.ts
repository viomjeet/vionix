export interface RegisterDTO {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  identifier: string; // email or username
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

export interface GoogleAuthDTO {
  credential?: string;
  // Optional mock/demo parameters for developer testing without Google Cloud setup
  email?: string;
  name?: string;
  googleId?: string;
  avatarUrl?: string;
}

export interface AuthUserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
}

export interface AuthSuccessData {
  token: string;
  user: AuthUserResponse;
}
