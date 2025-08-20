// src/components/charts/ReservationStatusChart.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {getReservationStatsByStatus} from '../../services/reservationService';
import { Paper, Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

const ReservationStatusChart = () => {
    const { t } = useTranslation();
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getReservationStatsByStatus();
                const translatedData = response.data.map(item => ({
                    ...item,
                    label: t(`status_${item.label}`)
                }));
                setChartData(translatedData);
            } catch (error) {
                console.error("Failed to fetch room stats:", error);
            }
        };
        fetchStats();
    }, [t]);

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                {t('rooms_by_status')}
            </Typography>
            {chartData.length > 0 ? (
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PieChart series={[{ data: chartData, innerRadius: 50 }]} width={400} height={200} />
                </Box>
            ) : (
                <Typography>{t('loading_stats_data')}</Typography>
            )}
        </Paper>
    );
};

export default ReservationStatusChart;