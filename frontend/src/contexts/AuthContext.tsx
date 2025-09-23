import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_COOKIE_NAME = 'auth_token';
const USER_COOKIE_NAME = 'user_data';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const login = useCallback((authToken: string, userData: User) => {
    console.log('AuthContext: Login called with:', { token: !!authToken, userData });

    setToken(authToken);
    setUser(userData);

    // Store in cookies (without secure flag for localhost)
    Cookies.set(TOKEN_COOKIE_NAME, authToken, { expires: 1, sameSite: 'lax' });
    Cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), { expires: 1, sameSite: 'lax' });

    console.log('AuthContext: Login completed, state updated');
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);

    // Remove from cookies
    Cookies.remove(TOKEN_COOKIE_NAME);
    Cookies.remove(USER_COOKIE_NAME);
  }, []);

  const checkAuth = useCallback(() => {
    console.log('AuthContext: Checking authentication');
    setIsLoading(true);

    try {
      const storedToken = Cookies.get(TOKEN_COOKIE_NAME);
      const storedUser = Cookies.get(USER_COOKIE_NAME);

      console.log('AuthContext: Stored credentials:', {
        hasToken: !!storedToken,
        hasUser: !!storedUser
      });

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        console.log('AuthContext: Authentication restored from cookies', userData);
      } else {
        console.log('AuthContext: No stored credentials found');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};