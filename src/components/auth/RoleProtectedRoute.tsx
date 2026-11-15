import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, role } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
