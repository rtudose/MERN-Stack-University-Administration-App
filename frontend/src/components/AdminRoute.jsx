// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    // Redirect to a non-admin dashboard or a permission denied page
    return <Navigate to="/dashboard" replace />; // Assuming a generic user dashboard at /dashboard
  }

  return children;
};

export default AdminRoute;