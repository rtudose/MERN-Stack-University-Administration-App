// src/pages/AdminStatistics.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Grid, Paper } from '@mui/material';
import BackButton from '../components/BackButton';

import StudentRegistrationChart from '../components/charts/StudentRegistrationChart';
import RoomStatusChart from '../components/charts/RoomStatusChart';
import CoursesByYearChart from '../components/charts/CoursesByYearChart';
import ProfessorWorkloadList from '../components/charts/ProfessorWorkloadList';
import ReservationStatusChart from '../components/charts/ReservationStatusChart';
import AppointmentStatusChart from '../components/charts/AppointmentStatusChart';

const AdminStatistics = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        {t('faculty_statistics_title')}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={ 12 }>
          <ProfessorWorkloadList />
        </Grid>
        
        <Grid size={ 12 }>
          <StudentRegistrationChart />
        </Grid>
        
        <Grid size={ 12 }>
          <CoursesByYearChart />
        </Grid>
        
        <Grid size={ 12 }>
          <RoomStatusChart />
        </Grid>

        <Grid size={ 12 }>
          <ReservationStatusChart />
        </Grid>

        <Grid size={ 12 }>
          <AppointmentStatusChart />
        </Grid>

      </Grid>
    </Container>
  );
};

export default AdminStatistics;
