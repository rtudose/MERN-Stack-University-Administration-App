import React from 'react';
import { Container, Typography } from '@mui/material';
import AppointmentStatusChart from '../components/charts/AppointmentStatusChart';
import CoursesByYearChart from '../components/charts/CoursesByYearChart';
import ProfessorWorkloadList from '../components/charts/ProfessorWorkloadList';
import ReservationStatusChart from '../components/charts/ReservationStatusChart';
import RoomStatusChart from '../components/charts/RoomStatusChart';
import StudentRegistrationChart from '../components/charts/StudentRegistrationChart';

const Statistics = () => {
    return (
        <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Faculty Statistics
            </Typography>
            
            <AppointmentStatusChart />
            <CoursesByYearChart />
            <ProfessorWorkloadList />
            <ReservationStatusChart />
            <RoomStatusChart />
            <StudentRegistrationChart />

        </Container>
    );
};

export default Statistics;