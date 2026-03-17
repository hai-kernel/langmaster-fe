import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  allowedRoles, 
  requiredPermission,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, checkPermission } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const roleDashboards = {
      student: '/',
      teacher: '/teacher',
      admin: '/admin',
    };
    return <Navigate to={roleDashboards[user.role]} replace />;
  }

  // Check permission-based access
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
