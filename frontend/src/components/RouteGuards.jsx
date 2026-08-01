import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Guard for routes that require any authenticated user
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Guard for routes that require an authenticated Admin user
 */
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying admin credentials..." />;
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  if (user.role !== 'admin') {
    // If standard user tries to access admin path, redirect to standard home dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Guard for guest-only pages (e.g., User Login, User Signup)
 * If logged in, redirects users to home/dashboard
 */
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading page..." />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Guard for guest admin-only pages (e.g., Admin Login)
 * If logged in as admin, redirects to Admin Dashboard
 */
export const AdminGuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading page..." />;
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
