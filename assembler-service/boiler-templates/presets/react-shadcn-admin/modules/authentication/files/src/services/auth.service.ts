import axios, { AxiosResponse } from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
  ApiError,
} from '@/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await authApi.post('/login', credentials);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await authApi.post('/register', userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await authApi.post('/forgot-password', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await authApi.post('/reset-password', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await authApi.get('/me');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response: AxiosResponse<AuthResponse> = await authApi.post('/refresh', {
        refreshToken,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async logout(): Promise<void> {
    try {
      await authApi.post('/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  static async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await authApi.post('/verify-email', { token });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static async resendVerificationEmail(): Promise<{ message: string }> {
    try {
      const response = await authApi.post('/resend-verification');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  static storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('auth_user', JSON.stringify(authResponse.user));
    if (authResponse.refreshToken) {
      localStorage.setItem('refresh_token', authResponse.refreshToken);
    }
  }

  static getStoredUser(): User | null {
    try {
      const user = localStorage.getItem('auth_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  static getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('refresh_token');
  }

  private static handleError(error: any): ApiError {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
        statusCode: error.response.status,
      };
    }
    return {
      message: error.message || 'Network error occurred',
      statusCode: 0,
    };
  }
}