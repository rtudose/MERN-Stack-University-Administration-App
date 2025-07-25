// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Import MUI components and icons
import { Container, Box, Typography, Button, Stack } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

function Dashboard() {
  const { t } = useTranslation();
  const { user, isAuthenticated, loading, isStudent, isExternalRepresentative, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // This logic is preserved to correctly redirect admins away from this page
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (user && user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        setDashboardLoading(false);
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleBookRoomClick = () => {
    alert('Room booking page is not yet implemented.');
  };

  const handleViewCoursesClick = () => {
    alert('My Courses page is not yet implemented.');
  };

  if (loading || dashboardLoading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>{t('loading_dashboard')}</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', my: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('user_dashboard_title')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('welcome_user', { username: user.username })}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        {/* Conditional rendering for the buttons */}
        {isStudent && (
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<SchoolIcon />}
            onClick={handleViewCoursesClick}
          >
            {t('view_my_courses_button')}
          </Button>
        )}
        
        {isExternalRepresentative && (
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<MeetingRoomIcon />}
            onClick={handleBookRoomClick}
          >
            {t('book_a_room_button')}
          </Button>
        )}
      </Stack>

      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Button variant="outlined" color="error" onClick={logout}>
          {t('logout_button')}
        </Button>
      </Box>
    </Container>
  );
}

export default Dashboard;