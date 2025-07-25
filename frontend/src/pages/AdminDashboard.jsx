// src/pages/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Import MUI components and icons
import { Container, Box, Typography, Button, Stack } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return <div>{t('loading_dashboard')}</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', my: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('admin_dashboard_title')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('welcome_user', { username: user.username })}
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }} // Stack vertically on small screens, horizontally on others
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<ApartmentIcon />}
          onClick={() => navigate('/rooms')}
          sx={{ minWidth: '240px' }}
        >
          {t('manage_rooms_button')}
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<PeopleIcon />}
          onClick={() => navigate('/users')}
          sx={{ minWidth: '240px' }}
        >
          {t('manage_users_button')}
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<SchoolIcon />}
          onClick={() => navigate('/courses-management')}
          sx={{ minWidth: '240px' }}
        >
          {t('manage_courses_button')}
        </Button>
      </Stack>

      {/* Logout button can be placed in the Navbar, but we'll keep it here for now */}
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Button variant="outlined" color="error" onClick={logout}>
          {t('logout_button')}
        </Button>
      </Box>
    </Container>
  );
};

export default AdminDashboard;