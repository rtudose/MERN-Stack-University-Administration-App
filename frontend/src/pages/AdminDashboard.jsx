// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getStats } from '../services/adminService'; // Assuming a central api export
import {
  Container, Box, Typography, Grid, Card, CardActionArea,
  CardContent, Avatar, Badge
} from '@mui/material';
import { blue, orange, green, purple, red, cyan } from '@mui/material/colors';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BarChartIcon from '@mui/icons-material/BarChart';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  const dashboardItems = [
    { textKey: 'manage_users_button', icon: <PeopleIcon />, path: '/users', stat: stats?.userCount, color: blue[500] },
    { textKey: 'manage_rooms_button', icon: <ApartmentIcon />, path: '/rooms', stat: stats?.roomCount, color: green[500] },
    { textKey: 'manage_courses_button', icon: <SchoolIcon />, path: '/courses-management', color: orange[500] },
    { textKey: 'manage_schedule_button', icon: <ScheduleIcon />, path: '/schedule-management', color: purple[500] },
    { textKey: 'manage_reservations_button', icon: <EventAvailableIcon />, path: '/reservations-management', stat: stats?.pendingReservations, badge: true, color: red[500] },
    { textKey: 'manage_appointments_button', icon: <FactCheckIcon />, path: '/appointments-management', stat: stats?.pendingAppointments, badge: true, color: cyan[500] },
    { textKey: 'view_statistics_button', icon: <BarChartIcon />, path: '/admin-statistics', color: '#some_color' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', my: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom>{t('admin_dashboard_title')}</Typography>
        <Typography variant="h6" color="text.secondary">{t('welcome_user', { username: user?.username })}</Typography>
      </Box>

      <Grid container spacing={3} sx={{ width: '100%' }}>
        {dashboardItems.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.path}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => navigate(item.path)} sx={{ height: '100%', p: 2 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Badge color="error" badgeContent={item.badge ? item.stat : 0} invisible={!item.badge || !item.stat}>
                    <Avatar sx={{ bgcolor: item.color, width: 56, height: 56 }}>{item.icon}</Avatar>
                  </Badge>
                  <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
                    {t(item.textKey)}
                  </Typography>
                  {item.stat !== undefined && !item.badge && (
                    <Typography variant="h5" color="text.secondary">{stats ? item.stat : '...'}</Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminDashboard;