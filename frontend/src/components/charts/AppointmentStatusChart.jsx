// src/components/charts/AppointmentStatusChart.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAppointmentStatsByStatus } from '../../services/appointmentService';
import { Paper, Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

const AppointmentStatusChart = () => {
    const { t } = useTranslation();
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getAppointmentStatsByStatus();
                const translatedData = response.data.map(item => ({
                    ...item,
                    label: t(`appointment_status_${item.label}`)
                }));
                setChartData(translatedData);
            } catch (error) {
                console.error("Failed to fetch appointment stats:", error);
            }
        };
        fetchStats();
    }, [t]);

    return (
        <Paper sx={{ p: 2, mb: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                {t('appointments_by_status')}
            </Typography>
            {chartData.length > 0 ? (
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PieChart
                        series={[{
                            data: chartData,
                            innerRadius: 50,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                        }]}
                        width={400}
                        height={200}
                    />
                </Box>
            ) : (
                <Typography sx={{ textAlign: 'center', pt: 2 }}>{t('loading_stats_data')}</Typography>
            )}
        </Paper>
    );
};

export default AppointmentStatusChart;
