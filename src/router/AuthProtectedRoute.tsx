import { useAuth } from '@/store/auth-slice';
import React from 'react';
import { Navigate } from 'react-router';

const AuthProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAuth((state) => state.isAuth);

  if (isAuth) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AuthProtectedRoute;