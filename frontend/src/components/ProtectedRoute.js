import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles, message }) {
  const { user, loading, authChecked } = useAuth();
  const location = useLocation();

  if (!authChecked || loading) return null;

  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ message: message || null, from: location.pathname }}
      />
    );
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
