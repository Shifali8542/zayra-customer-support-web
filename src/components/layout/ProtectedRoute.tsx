import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

/** Redirect to /login if the user is not authenticated. */
const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
