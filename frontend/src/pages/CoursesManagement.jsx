// src/pages/CoursesManagement.jsx (Refactored with MUI)
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from '../services/courseService';

// Import MUI components and icons
import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BackButton from '../components/BackButton';

const CoursesManagement = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', credits: '', professor: '', department: '',
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllCourses();
      setCourses(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError('fetch_courses_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentCourseId(null);
    setFormData({ name: '', code: '', description: '', credits: '', professor: '', department: '' });
  };

  const getTranslatedError = (msg) => {
    if (msg.includes('is required')) return 'course_form_error_required';
    if (msg.includes('is less than minimum allowed value')) return 'course_credits_min_error';
    if (msg.includes('A course with this code already exists')) return 'course_code_exists_error';
    if (msg.includes('A course with this name already exists')) return 'course_name_exists_error';
    return 'generic_error';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ text: '', type: '' });

    const creditsNumber = Number(formData.credits);
    if (!Number.isInteger(creditsNumber)) {
      setFormMessage({ text: 'course_credits_integer_error', type: 'error' });
      return;
    }

    const courseData = { ...formData, credits: creditsNumber };

    try {
      if (isEditing) {
        await updateCourse(currentCourseId, courseData);
        setFormMessage({ text: 'course_updated_success', type: 'success' });
      } else {
        await createCourse(courseData);
        setFormMessage({ text: 'course_created_success', type: 'success' });
      }
      resetForm();
      fetchCourses();
    } catch (err) {
      const errorKey = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : 'generic_error';
      setFormMessage({ text: errorKey, type: 'error' });
    }
  };

  const handleEditClick = (course) => {
    setFormMessage({ text: '', type: '' });
    setIsEditing(true);
    setCurrentCourseId(course._id);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits,
      professor: course.professor,
      department: course.department || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (courseId) => {
    if (window.confirm(t('delete_course_confirm'))) {
      try {
        await deleteCourse(courseId);
        setFormMessage({ text: 'course_deleted_success', type: 'success' });
        fetchCourses();
      } catch (err) {
        setFormMessage({ text: 'delete_course_error', type: 'error' });
      }
    }
  };

  if (loading) return <div>{t('loading_courses')}</div>;
  if (error) return <Alert severity="error">{t(error)}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
       <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('courses_management_title')}
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEditing ? t('edit_course_title') : t('add_new_course_title')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth required id="name" label={t('course_name_label')} value={formData.name} onChange={handleInputChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth required id="code" label={t('course_code_label')} value={formData.code} onChange={handleInputChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth required id="credits" label={t('course_credits_label')} value={formData.credits} onChange={handleInputChange} type="number" inputProps={{ min: 1, step: 1 }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth required id="professor" label={t('course_professor_label')} value={formData.professor} onChange={handleInputChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth id="department" label={t('course_department_label')} value={formData.department} onChange={handleInputChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth id="description" label={t('course_description_label')} value={formData.description} onChange={handleInputChange} multiline rows={3} /></Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained">{isEditing ? t('update_course_button') : t('add_course_button')}</Button>
            {isEditing && (<Button variant="outlined" onClick={() => { resetForm(); setFormMessage({ text: '', type: '' }); }}>{t('cancel_button')}</Button>)}
          </Stack>
        </Box>
        {formMessage.text && <Alert severity={formMessage.type} sx={{ mt: 2 }}>{t(formMessage.text)}</Alert>}
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" component="h2" gutterBottom>{t('existing_courses_title')}</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('course_code_label')}</TableCell>
                <TableCell>{t('course_name_label')}</TableCell>
                <TableCell>{t('course_professor_label')}</TableCell>
                <TableCell align="right">{t('course_credits_label')}</TableCell>
                <TableCell align="center">{t('actions_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.professor}</TableCell>
                  <TableCell align="right">{course.credits}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditClick(course)} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteClick(course._id)} color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default CoursesManagement;