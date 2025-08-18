// src/components/charts/CoursesByYearChart.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCourseStatsByYear } from '../../services/courseService';
import { Paper, Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

const CoursesByYearChart = () => {
    const { t } = useTranslation();
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getCourseStatsByYear();
                setChartData(response.data);
            } catch (error) {
                console.error("Failed to fetch course stats:", error);
            }
        };
        fetchStats();
    }, []);

    if (chartData.length === 0) return <Typography>{t('loading_stats_data')}</Typography>;

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                {t('courses_by_year')}
            </Typography>
            <Box sx={{ height: 300 }}>
                <BarChart
                    dataset={chartData}
                    xAxis={[{ scaleType: 'band', dataKey: 'year', label: t('year_of_study') }]}
                    series={[{ dataKey: 'value', label: t('number_of_courses') }]}
                />
            </Box>
        </Paper>
    );
};

export default CoursesByYearChart;