import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ApiError
} from '@/types/auth.types';
import { AuthService } from '@/services/auth.service';

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const initialState: AuthState & { error: string | null } = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: null,
  error: null,
};

const authReducer = (
  state: AuthState & { error: string | null },
  action: AuthAction
): AuthState & { error: string | null } => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = AuthService.getStoredToken();
      const user = AuthService.getStoredUser();

      if (token && user) {
        // Verify token is still valid by fetching current user
        try {
          const currentUser = await AuthService.getCurrentUser();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: currentUser, token },
          });
        } catch (error) {
          // Token is invalid, clear stored data
          AuthService.clearAuthData();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const authResponse = await AuthService.login(credentials);
      AuthService.storeAuthData(authResponse);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: authResponse.user,
          token: authResponse.token,
        },
      });
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({
        type: 'AUTH_FAILURE',
        payload: apiError.message,
      });
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const authResponse = await AuthService.register(userData);
      AuthService.storeAuthData(authResponse);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: authResponse.user,
          token: authResponse.token,
        },
      });
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({
        type: 'AUTH_FAILURE',
        payload: apiError.message,
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const forgotPassword = async (data: ForgotPasswordRequest): Promise<void> => {
    try {
      await AuthService.forgotPassword(data);
    } catch (error) {
      const apiError = error as ApiError;
      throw apiError;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};