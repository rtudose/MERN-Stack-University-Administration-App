// src/pages/MySchedule.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getMySchedule } from '../services/scheduleService';
import BackButton from '../components/BackButton';
import { Container, Typography, Grid, Card, CardContent, Alert, Box, Paper } from '@mui/material';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const MySchedule = () => {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMySchedule();
      setSchedule(response.data);
    } catch (err) {
      setError('fetch_schedule_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Group schedule entries by day of the week
  const scheduleByDay = useMemo(() => {
    const grouped = {};
    daysOfWeek.forEach(day => grouped[day] = []);
    schedule.forEach(entry => {
      if (grouped[entry.dayOfWeek]) {
        grouped[entry.dayOfWeek].push(entry);
      }
    });
    // Sort entries within each day by start time
    for (const day in grouped) {
        grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return grouped;
  }, [schedule]);

  if (loading) return <div>{t('loading_schedule')}</div>;
  if (error) return <Alert severity="error">{t(error)}</Alert>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('my_schedule_title')}
      </Typography>

      <Grid container spacing={2}>
        {daysOfWeek.map((day) => (
          <Grid item xs={12} md={6} lg={2.4} key={day}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" align="center" gutterBottom>
                {t(`day_${day}`)}
              </Typography>
              {scheduleByDay[day].length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                  {t('no_classes_today')}
                </Typography>
              ) : (
                scheduleByDay[day].map(entry => (
                  <Card key={entry._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                        {entry.course.name}
                      </Typography>
                      <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        {entry.startTime} - {entry.endTime} | {t(`type_${entry.type}`)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('room_label')}:</strong> {entry.room.name}
                      </Typography>
                      {entry.group && (
                         <Typography variant="body2">
                            <strong>{t('group_label')}:</strong> {entry.group}
                         </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MySchedule;