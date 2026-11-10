import { useAuth } from '@/store/auth-slice';
import React from 'react';
import { Navigate } from 'react-router';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAuth((state) => state.isAuth);

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export default ProtectedRoute;