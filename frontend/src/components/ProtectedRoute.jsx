// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    // Optionally render a loading spinner or message while AuthContext initializes
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Check if user has one of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // Authenticated but not authorized for this route, redirect to a default dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and authorized, render the child routes via Outlet
  return <Outlet />;
};

export default ProtectedRoute;