// src/pages/Dashboard.jsx (Refactored Version)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Container, Box, Typography, Grid, Card, CardActionArea,
  CardContent, Avatar
} from '@mui/material';
import { blue, orange, green, purple } from '@mui/material/colors';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import RateReviewIcon from '@mui/icons-material/RateReview';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  const dashboardItems = [
    { textKey: 'my_schedule_button', icon: <SchoolIcon />, path: '/my-schedule', roles: ['student', 'teacher'], color: blue[500] },
    { textKey: 'book_appointment_button', icon: <AssignmentIndIcon />, path: '/book-appointment', roles: ['student'], color: green[500] },
    { textKey: 'my_appointments_button', icon: <RateReviewIcon />, path: '/my-appointments', roles: ['student'], color: green[700] },
    { textKey: 'book_a_room_button', icon: <MeetingRoomIcon />, path: '/book-room', roles: ['external_representative', 'teacher'], color: orange[500] },
    { textKey: 'my_reservations_button', icon: <PlaylistAddCheckIcon />, path: '/my-reservations', roles: ['external_representative', 'teacher'], color: orange[700] },
  ];

  if (loading || !user) {
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

      <Grid container spacing={3} justifyContent="center" sx={{ width: '100%' }}>
        {dashboardItems
          .filter(item => item.roles.includes(user.role))
          .map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.path}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea onClick={() => navigate(item.path)} sx={{ height: '100%', p: 2 }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: item.color, width: 56, height: 56 }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
                      {t(item.textKey)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;