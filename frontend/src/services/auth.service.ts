import axios from 'axios';
import type { User } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}

export class AuthService {
  static getGoogleLoginUrl(): string {
    return `${API_BASE_URL}/auth/google`;
  }

  static parseJwtPayload(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as JwtPayload;
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  static extractUserFromToken(token: string): User | null {
    const payload = this.parseJwtPayload(token);
    if (!payload) return null;

    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.parseJwtPayload(token);
    if (!payload) return true;

    const now = Date.now() / 1000;
    return payload.exp < now;
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  static redirectToGoogleLogin(): void {
    window.location.href = this.getGoogleLoginUrl();
  }
}