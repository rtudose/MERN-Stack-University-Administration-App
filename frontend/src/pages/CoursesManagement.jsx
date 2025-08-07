// src/pages/CoursesManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from '../services/courseService';
import BackButton from '../components/BackButton';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CoursesManagement = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  
  const initialState = {
    name: '', code: '', description: '', credits: '', department: '',
    yearOfStudy: 1, semester: 1, specialization: 'General',
    professors: { lecture: '', seminar: '', lab: '' }
  };
  const [formData, setFormData] = useState(initialState);

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
    const { name, value } = e.target;
    if (['lecture', 'seminar', 'lab'].includes(name)) {
        setFormData(prev => ({ ...prev, professors: { ...prev.professors, [name]: value } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentCourseId(null);
    setFormData(initialState);
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

    const { name, code, credits, professors, yearOfStudy, semester, specialization } = formData;
    if (!name.trim() || !code.trim() || !String(credits).trim() || !professors.lecture.trim() || !yearOfStudy || !semester || !specialization.trim()) {
      setFormMessage({ text: 'course_form_error_all_fields', type: 'error' });
      return;
    }
    const creditsNumber = Number(credits);
    if (!Number.isInteger(creditsNumber) || creditsNumber < 1) {
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
      department: course.department || '',
      yearOfStudy: course.yearOfStudy,
      semester: course.semester,
      specialization: course.specialization,
      professors: course.professors || { lecture: '', seminar: '', lab: '' }
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
    <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            <Grid item xs={12} md={6}><TextField fullWidth required name="name" label={t('course_name_label')} value={formData.name} onChange={handleInputChange} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth required name="code" label={t('course_code_label')} value={formData.code} onChange={handleInputChange} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth required name="credits" label={t('course_credits_label')} value={formData.credits} onChange={handleInputChange} type="number" inputProps={{ min: 1, step: 1 }} /></Grid>
            
            <Grid item xs={12} md={4}>
              <TextField fullWidth required name="lecture" label={t('lecture_professor_label')} value={formData.professors.lecture} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth name="seminar" label={t('seminar_professor_label')} value={formData.professors.seminar} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth name="lab" label={t('lab_professor_label')} value={formData.professors.lab} onChange={handleInputChange} />
            </Grid>

            <Grid item xs={12} md={3}><FormControl fullWidth required> <InputLabel>{t('course_year_label')}</InputLabel> <Select name="yearOfStudy" value={formData.yearOfStudy} label={t('course_year_label')} onChange={handleInputChange}> <MenuItem value={1}>1</MenuItem><MenuItem value={2}>2</MenuItem><MenuItem value={3}>3</MenuItem><MenuItem value={4}>4</MenuItem> </Select> </FormControl></Grid>
            <Grid item xs={12} md={3}><FormControl fullWidth required> <InputLabel>{t('course_semester_label')}</InputLabel> <Select name="semester" value={formData.semester} label={t('course_semester_label')} onChange={handleInputChange}> <MenuItem value={1}>1</MenuItem><MenuItem value={2}>2</MenuItem> </Select> </FormControl></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth required name="specialization" label={t('course_specialization_label')} value={formData.specialization} onChange={handleInputChange} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth name="department" label={t('course_department_label')} value={formData.department} onChange={handleInputChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth name="description" label={t('course_description_label')} value={formData.description} onChange={handleInputChange} multiline rows={3} /></Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained">{isEditing ? t('update_course_button') : t('add_course_button')}</Button>
            {isEditing && (<Button variant="outlined" onClick={resetForm}>{t('cancel_button')}</Button>)}
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
                <TableCell>{t('lecture_professor_label')}</TableCell>
                <TableCell align="center">{t('actions_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.professors?.lecture}</TableCell>
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