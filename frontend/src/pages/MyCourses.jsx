// src/pages/MyCourses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyCourses } from '../services/courseService';
import BackButton from '../components/BackButton';

import {
  Container, Typography, Grid, Card, CardContent,
  Alert, Box, Chip, Stack
} from '@mui/material';

const MyCourses = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyCourses();
      setCourses(response.data);
    } catch (err) {
      setError('fetch_courses_error'); // Can reuse this key
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading) return <div>{t('loading_courses')}</div>;
  if (error) return <Alert severity="error">{t(error)}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('my_courses_title')}
      </Typography>

      {courses.length === 0 ? (
        <Typography sx={{ textAlign: 'center', mt: 4 }}>
            {t('no_courses_found')}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item key={course._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">{course.name}</Typography>
                  <Typography color="text.secondary" gutterBottom>{course.code}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label={`${t('course_year_label')} ${course.yearOfStudy}`} size="small" />
                    <Chip label={`${t('course_semester_label')} ${course.semester}`} size="small" />
                  </Stack>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>{course.description}</Typography>
                  <Typography><strong>{t('course_professor_label')}:</strong> {course.professor}</Typography>
                  <Typography><strong>{t('course_credits_label')}:</strong> {course.credits}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyCourses;