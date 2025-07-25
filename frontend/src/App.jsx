// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Users from './pages/Users';
import CoursesManagement from './pages/CoursesManagement';
import AdminDashboard from './pages/AdminDashboard';
// import Register from './pages/Register'; // Uncomment if you have a register page
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useTranslation } from 'react-i18next';
import { ColorModeProvider } from './context/ThemeContext';
import { CssBaseline } from '@mui/material';

function App() {
  const { t } = useTranslation();

  return (
    <ColorModeProvider>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <div>
            <h1 style={{ textAlign: 'center', color: '#0056b3', marginTop: '20px' }}>{t('app_title')}</h1>

            <Navbar />

            <Routes>
              <Route path="/login" element={<Login />} />
              {/* <Route path="/register" element={<Register />} /> */}

              {/* Default path, redirects to /login if not authenticated, or Dashboard if authenticated */}
              {/* This route now ensures that if you hit the root URL, it redirects appropriately */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Dashboard for authenticated users (both admin and student) */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'student', 'external_representative']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Optional: If you want root path (when logged in) to also go to Dashboard, you can add this index route */}
                {/* <Route index element={<Dashboard />} /> */}
              </Route>

              {/* Admin-only Protected Routes Group */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* This is the new Admin Dashboard route */}
                <Route path="/rooms" element={<Rooms />} /> {/* Your existing Rooms page for admins only */}
                <Route path="/users" element={<Users />} />
                <Route path="/courses-management" element={<CoursesManagement />} />
                {/* Add other admin-only routes here (e.g., /users, /courses-management) */}
              </Route>

              {/* Add more roles/routes as needed */}
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ColorModeProvider>
  );
}

export default App;