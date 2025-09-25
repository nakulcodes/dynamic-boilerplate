export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}