// src/pages/CoursesManagement.jsx (Refactored Version)
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPaginatedCourses, createCourse, updateCourse, deleteCourse, getCourseStatsByYear } from '../services/courseService';
import PaginatedTable from '../components/common/PaginatedTable';
import CoursesByYearChart from '../components/charts/CoursesByYearChart';
import BackButton from '../components/BackButton';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack, IconButton,
  Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CoursesManagement = () => {
  const { t } = useTranslation();
  const [formMessage, setFormMessage] = useState({ key: '', options: {}, type: 'success' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const initialState = {
    name: '', code: '', description: '', credits: '', department: '',
    yearOfStudy: 1, semester: 1, specialization: 'General',
    professors: { lecture: '', seminar: '', lab: '' }
  };
  const [formData, setFormData] = useState(initialState);
  
  const resetForm = () => {
    setIsEditing(false);
    setCurrentCourseId(null);
    setFormData(initialState);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['lecture', 'seminar', 'lab'].includes(name)) {
        setFormData(prev => ({ ...prev, professors: { ...prev.professors, [name]: value } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ key: '' });
  
    const { name, code, credits, professors } = formData;
    if (!name.trim() || !code.trim() || !String(credits).trim() || !professors.lecture.trim()) {
      setFormMessage({ key: 'course_form_error_all_fields', type: 'error' }); return;
    }
    const creditsNumber = Number(credits);
    if (!Number.isInteger(creditsNumber) || creditsNumber < 1) {
      setFormMessage({ key: 'course_credits_integer_error', type: 'error' }); return;
    }
    const courseData = { ...formData, credits: creditsNumber };
  
    try {
      if (isEditing) {
        await updateCourse(currentCourseId, courseData);
        setFormMessage({ key: 'course_updated_success', options: { courseName: courseData.name }, type: 'success' });
      } else {
        await createCourse(courseData);
        setFormMessage({ key: 'course_created_success', options: { courseName: courseData.name }, type: 'success' });
      }
      resetForm();
      setRefreshKey(oldKey => oldKey + 1);
    } catch (err) {
      const msg = err.response?.data?.msg || '';
      let errorKey = 'generic_error';
      if (msg.includes('code already exists')) errorKey = 'course_code_exists_error';
      else if (msg.includes('name already exists')) errorKey = 'course_name_exists_error';
      setFormMessage({ key: errorKey, type: 'error' });
    }
  };

  const handleEditClick = (course) => {
    setFormMessage({ key: '' });
    setIsEditing(true);
    setCurrentCourseId(course._id);
    setFormData({ ...initialState, ...course });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteClick = async (courseId) => {
    if (window.confirm(t('delete_course_confirm'))) {
      try {
        await deleteCourse(courseId);
        setFormMessage({ key: 'course_deleted_success', type: 'success' });
        setRefreshKey(oldKey => oldKey + 1);
      } catch (err) {
        setFormMessage({ key: 'delete_course_error', type: 'error' });
      }
    }
  };

  const courseColumns = [
    { id: 'code', label: 'course_code_label', sortable: true },
    { id: 'name', label: 'course_name_label', sortable: true },
    { id: 'yearOfStudy', label: 'course_year_label', sortable: true },
    { id: 'semester', label: 'course_semester_label', sortable: true },
    { id: 'professors.lecture', label: 'lecture_professor_label', sortable: true, renderCell: (row) => row.professors?.lecture || 'N/A' },
    {
      id: 'actions',
      label: 'actions_label',
      align: 'center',
      renderCell: (row) => (
        <>
          <IconButton onClick={() => handleEditClick(row)} color="primary"><EditIcon /></IconButton>
          <IconButton onClick={() => handleDeleteClick(row._id)} color="error"><DeleteIcon /></IconButton>
        </>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ pt: 2, pb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('courses_management_title')}
      </Typography>

      {formMessage.key && (
        <Alert severity={formMessage.type} sx={{ mb: 2 }} onClose={() => setFormMessage({ key: '' })}>
          {t(formMessage.key, formMessage.options)}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button variant="outlined" onClick={() => setShowStats(prev => !prev)}>
          {showStats ? t('hide_stats') : t('show_stats')}
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
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

      {showStats && <CoursesByYearChart />}

      <PaginatedTable
        columns={courseColumns}
        fetchDataFunction={getPaginatedCourses}
        refreshKey={refreshKey}
        titleKey="existing_courses_title"
      />
    </Container>
  );
};

export default CoursesManagement;