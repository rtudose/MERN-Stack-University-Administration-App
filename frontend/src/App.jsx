// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ColorModeProvider } from './context/ThemeContext';
import { CssBaseline, Box } from '@mui/material';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Users from './pages/Users';
import CoursesManagement from './pages/CoursesManagement';
import BookRoom from './pages/BookRoom';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import MyReservations from './pages/MyReservations';
import MySchedulePage from './pages/MySchedule.jsx';
import AdminDashboard from './pages/AdminDashboard';
import ReservationsManagement from './pages/ReservationsManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import AppointmentsManagement from './pages/AppointmentsManagement';
// import Register from './pages/Register'; // Uncomment if you have a register page
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';


function App() {
  const { t } = useTranslation();

  return (
    <ColorModeProvider>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* SHARED Routes for multiple roles */}
                <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'external_representative']} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                {/* STUDENT & TEACHER Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student', 'teacher']} />}>
                  <Route path="/my-schedule" element={<MySchedulePage />} />
                </Route>
                
                {/* STUDENT-only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                    <Route path="/book-appointment" element={<BookAppointment />} />
                    <Route path="/my-appointments" element={<MyAppointments />} />
                </Route>
                
                {/* EXTERNAL REP-only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['external_representative']} />}>
                    <Route path="/book-room" element={<BookRoom />} />
                    <Route path="/my-reservations" element={<MyReservations />} />
                </Route>

                {/* ADMIN-only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/courses-management" element={<CoursesManagement />} />
                  <Route path="/reservations-management" element={<ReservationsManagement />} />
                  <Route path="/schedule-management" element={<ScheduleManagement />} />
                </Route>
              </Routes>
            </Box>
          </Box>
        </AuthProvider>
      </Router>
    </ColorModeProvider>
  );
}

export default App;