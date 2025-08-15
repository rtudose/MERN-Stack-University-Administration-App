import React from 'react';
import { Container, Typography } from '@mui/material';
import StudentRegistrationChart from '../components/charts/StudentRegistrationChart';
// ... import other chart components you create in the future

const Statistics = () => {
    return (
        <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Faculty Statistics
            </Typography>
            
            {/* You can just place your reusable component here! */}
            <StudentRegistrationChart />

            {/* <OtherChartComponent /> */}
            {/* <AnotherChartComponent /> */}

        </Container>
    );
};

export default Statistics;