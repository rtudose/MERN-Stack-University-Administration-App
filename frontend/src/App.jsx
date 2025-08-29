// src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ColorModeContext, ColorModeProvider } from './context/ThemeContext';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { getCustomTheme } from './theme/theme';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import GlobalStyles from './components/GlobalStyles';

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
import ScheduleManagement from './pages/ScheduleManagement.jsx';
import AppointmentsManagement from './pages/AppointmentsManagement';
// import Register from './pages/Register'; // Uncomment if you have a register page
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AdminStatistics from './pages/AdminStatistics';

function AppContent() {
  return (
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
                
                {/* EXTERNAL REP & TEACHER Routes */}
                <Route element={<ProtectedRoute allowedRoles={['teacher', 'external_representative']} />}>
                    <Route path="/book-room" element={<BookRoom />} />
                    <Route path="/my-reservations" element={<MyReservations />} />
                </Route>

                {/* STUDENT-only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                    <Route path="/book-appointment" element={<BookAppointment />} />
                    <Route path="/my-appointments" element={<MyAppointments />} />
                </Route>

                {/* ADMIN-only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/courses-management" element={<CoursesManagement />} />
                  <Route path="/reservations-management" element={<ReservationsManagement />} />
                  <Route path="/schedule-management" element={<ScheduleManagement />} />
                  <Route path="/appointments-management" element={<AppointmentsManagement />} />
                  <Route path="/admin-statistics" element={<AdminStatistics />} />
                </Route>
              </Routes>
            </Box>
          </Box>
        </AuthProvider>
      </Router>
  );
}

const ThemeWrapper = ({ children }) => {
  const { mode } = useContext(ColorModeContext);
  const theme = React.useMemo(() => getCustomTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <ColorModeProvider>
      <ThemeWrapper>
        <AppContent />
      </ThemeWrapper>
    </ColorModeProvider>
    </LocalizationProvider>
  );
}

export default App;