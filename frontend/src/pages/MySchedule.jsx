// src/pages/MySchedule.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getStudentSchedule } from '../services/scheduleService';
import { getTeacherSchedule } from '../services/scheduleService';
import BackButton from '../components/BackButton';
import ScheduleView from '../components/schedule/ScheduleView'; // Import the new view
import { Container, Alert } from '@mui/material';

const MySchedulePage = () => {
  const { t } = useTranslation();
  const { isStudent, isTeacher } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (isStudent) {
        response = await getStudentSchedule();
        setTitle(t('my_schedule_title'));
      } else if (isTeacher) {
        response = await getTeacherSchedule();
        setTitle(t('my_schedule_teacher_title'));
      }
      if (response) {
        setSchedule(response.data);
      }
    } catch (err) {
      setError('fetch_schedule_error');
    } finally {
      setLoading(false);
    }
  }, [isStudent, isTeacher, t]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  if (loading) return <div>{t('loading_schedule')}</div>;
  if (error) return <Alert severity="error">{t(error)}</Alert>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <ScheduleView schedule={schedule} title={title} />
    </Container>
  );
};

export default MySchedulePage;