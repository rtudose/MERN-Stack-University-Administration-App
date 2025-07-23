// src/components/ProtectedRoute.jsx (Create this file if it doesn't exist, or ensure its content matches)
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // Import Outlet
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    // Optionally render a loading spinner or message while AuthContext initializes
    return <div>Loading authentication...</div>; // You can replace this with a proper loading component
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Check if user has one of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // Authenticated but not authorized for this route, redirect to a default dashboard
      // or a 403 Forbidden page. Redirecting to general dashboard is safer for user experience.
      return <Navigate to="/dashboard" replace />; // Redirect to generic dashboard
    }
  }

  // User is authenticated and authorized, render the child routes via Outlet
  return <Outlet />;
};

export default ProtectedRoute;