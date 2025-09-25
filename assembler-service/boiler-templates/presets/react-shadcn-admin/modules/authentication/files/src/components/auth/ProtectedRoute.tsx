import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: User['role'] | User['role'][];
  redirectTo?: string;
  fallback?: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/auth/login',
  fallback: Fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    if (Fallback) {
      return <Fallback />;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated (login/register pages)
  if (!requireAuth && isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Check role requirements
  if (requireAuth && isAuthenticated && requiredRole && user) {
    const userRole = user.role;
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Hook for checking permissions
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: User['role'] | User['role'][]) => {
    if (!isAuthenticated || !user) return false;

    return Array.isArray(role)
      ? role.includes(user.role)
      : user.role === role;
  };

  const isAdmin = () => hasRole('admin');
  const isUser = () => hasRole('user');

  return {
    hasRole,
    isAdmin,
    isUser,
    currentRole: user?.role,
  };
};