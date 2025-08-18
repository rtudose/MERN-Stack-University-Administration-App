// src/components/charts/StudentRegistrationChart.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getStudentRegistrationStats } from '../../services/userService';
import { Paper, Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

const StudentRegistrationChart = () => {
    const { t } = useTranslation();
    const [statsData, setStatsData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getStudentRegistrationStats();
                setStatsData(response.data);
            } catch (error) {
                console.error("Failed to fetch registration stats:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                {t('student_registration_evolution')}
            </Typography>
            {statsData.length > 0 ? (
                <Box sx={{ height: 300 }}>
                    <BarChart
                        xAxis={[{
                            scaleType: 'band',
                            data: statsData.map(item => item.year),
                            label: t('year_label')
                        }]}
                        series={[{
                            data: statsData.map(item => item.count),
                            label: t('number_of_students_label')
                        }]}
                    />
                </Box>
            ) : (
                <Typography>{t('no_stats_data')}</Typography>
            )}
        </Paper>
    );
};

export default StudentRegistrationChart;