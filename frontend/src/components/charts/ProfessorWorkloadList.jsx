// src/components/charts/ProfessorWorkloadList.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getProfessorWorkloadStats } from '../../services/scheduleService';
import { Paper, Typography, Box, Stack, LinearProgress, useTheme } from '@mui/material';

const ProfessorWorkloadList = ({ refreshKey }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [statsData, setStatsData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getProfessorWorkloadStats();
                setStatsData(response.data);
            } catch (error) {
                console.error("Failed to fetch professor workload stats:", error);
            }
        };
        fetchStats();
    }, [refreshKey]);

    if (statsData.length === 0) {
        return (
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                    {t('professor_workload')}
                </Typography>
                <Typography>{t('loading_stats_data')}</Typography>
            </Paper>
        );
    }

    const maxHours = Math.max(...statsData.map(item => item.hours), 0);

    return (
        <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                {t('professor_workload')}
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
                {statsData.map((prof) => (
                    <Box key={prof.professor}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body1">{prof.professor}</Typography>
                            <Typography variant="body1" color="text.secondary">{`${prof.hours.toFixed(1)}h`}</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={(prof.hours / maxHours) * 100}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: theme.palette.mode === 'dark' ? 'black' : theme.palette.grey[300],
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'primary.main',
                                },
                            }}
                        />
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
};

export default ProfessorWorkloadList;