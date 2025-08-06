// src/pages/ScheduleManagement.jsx (Final and Definitive Version)
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllScheduleEntries, createScheduleEntry, deleteScheduleEntry } from '../services/scheduleService';
import { getAllCourses } from '../services/courseService';
import { getAllRooms } from '../services/roomService';
import BackButton from '../components/BackButton';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Alert, Box, Grid, FormControl,
  InputLabel, Select, MenuItem, TextField, Button, Stack, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const dayOfWeekKeys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const academicYears = ['2024-2025', '2025-2026'];
const semesterKeys = [1, 2];
const activityTypeKeys = ['Lecture', 'Lab', 'Seminar', 'Practice'];

const ScheduleManagement = () => {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState({ text: '', type: '', details: null });
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

  const initialState = {
    course: '', room: '', dayOfWeek: dayOfWeekKeys[0], startTime: '08:00', endTime: '10:00',
    type: activityTypeKeys[0], group: '', academicYear: academicYears[0], semester: semesterKeys[0]
  };
  const [formData, setFormData] = useState(initialState);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [scheduleRes, coursesRes, roomsRes] = await Promise.all([ getAllScheduleEntries(), getAllCourses(), getAllRooms() ]);
      setSchedule(scheduleRes.data);
      setCourses(coursesRes.data);
      setRooms(roomsRes.data);
    } catch (err) { setError('fetch_schedule_error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'course') {
      const details = courses.find(c => c._id === value);
      setSelectedCourseDetails(details || null);
      setFormData(prev => ({ ...prev, course: value, semester: details ? details.semester : 1 }));
    } else if (name === 'room') {
      const details = rooms.find(r => r._id === value);
      setSelectedRoomDetails(details || null);
      setFormData(prev => ({ ...prev, room: value }));
    }
  };

  const getTranslatedError = (msg) => {
    if (!msg) return t('generic_error');
    if (msg.includes('is required')) return t('schedule_form_error_required');
     if (msg.includes('at path "room"') || msg.includes('at path "course"')) return t('schedule_form_error_selection');
    if (msg.includes('End time must be after start time')) return t('schedule_error_endtime');
    return t('generic_error');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ text: '', type: '' });
    try {
      await createScheduleEntry(formData);
      setFormMessage({ text: 'schedule_entry_created_success', type: 'success' });
      setFormData(initialState);
      setSelectedCourseDetails(null);
      setSelectedRoomDetails(null);
      fetchData();
    } catch (err) {
      const errorData = err.response?.data;
      if (['PROFESSOR_OVERLAP', 'ROOM_OVERLAP', 'COURSE_OVERLAP', 'STUDENT_GROUP_OVERLAP'].includes(errorData?.msg)) {
        let errorKey = `${errorData.msg.toLowerCase()}_error`;
        if (errorData.msg === 'STUDENT_GROUP_OVERLAP' && errorData.details?.type) {
          errorKey = `student_group_overlap_error_${errorData.details.type}`;
        }
        setFormMessage({ text: errorKey, type: 'error', details: errorData.details });
      } else {
        const errorText = getTranslatedError(errorData?.msg);
        setFormMessage({ text: errorText, type: 'error', details: null });
      }
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm(t('delete_schedule_entry_confirm'))) {
        try {
            await deleteScheduleEntry(id);
            setFormMessage({ text: 'schedule_entry_deleted_success', type: 'success' });
            fetchData();
        } catch (err) {
            setFormMessage({ text: 'generic_error', type: 'error' });
        }
    }
  };

  if (loading) return <div>{t('loading')}</div>;
  if (error) return <Alert severity="error">{t(error)}</Alert>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('schedule_management_title')}
      </Typography>
      {formMessage.text && 
        <Alert 
          severity={formMessage.type} 
          sx={{ mb: 2 }} 
          onClose={() => setFormMessage({ text: '', type: '' })}
        >
          {t(formMessage.text, { 
            ...formMessage.details, 
            dayOfWeek: formMessage.details?.dayOfWeek ? t(`day_${formMessage.details.dayOfWeek}`) : ''
          })}
        </Alert>
      }

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('add_schedule_entry_title')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><FormControl fullWidth required><InputLabel>{t('course_label')}</InputLabel><Select name="course" value={formData.course} label={t('course_label')} onChange={handleInputChange}>{courses.map(c => <MenuItem key={c._id} value={c._id}>{c.name} ({c.code})</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} md={6}><FormControl fullWidth required><InputLabel>{t('room_label')}</InputLabel><Select name="room" value={formData.room} label={t('room_label')} onChange={handleInputChange}>{rooms.map(r => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}</Select></FormControl></Grid>
            {(selectedCourseDetails || selectedRoomDetails) && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Grid container spacing={2}>
                        {selectedCourseDetails && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" gutterBottom>{t('course_details_label')}</Typography>
                                <Stack direction="row" spacing={3}>
                                    <TextField label={t('course_year_label')} value={selectedCourseDetails.yearOfStudy} InputProps={{ readOnly: true }} variant="standard" />
                                    <TextField label={t('course_specialization_label')} value={selectedCourseDetails.specialization} InputProps={{ readOnly: true }} variant="standard" />
                                </Stack>
                            </Grid>
                        )}
                        {selectedRoomDetails && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" gutterBottom>{t('room_details_label')}</Typography>
                                <Stack direction="row" spacing={3}>
                                    <TextField label={t('room_capacity_label')} value={selectedRoomDetails.capacity} InputProps={{ readOnly: true }} variant="standard" />
                                    <TextField label={t('equipment_label')} value={selectedRoomDetails.equipment.map(key => t(`equipment_${key}`)).join(', ') || 'None'} InputProps={{ readOnly: true }} variant="standard" fullWidth/>
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth required><InputLabel>{t('day_of_week_label')}</InputLabel><Select name="dayOfWeek" value={formData.dayOfWeek} label={t('day_of_week_label')} onChange={handleInputChange}>{dayOfWeekKeys.map(d => <MenuItem key={d} value={d}>{t(`day_${d}`)}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={6} md={3}><TextField fullWidth required name="startTime" label={t('start_time_label')} type="time" value={formData.startTime} onChange={handleInputChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6} md={3}><TextField fullWidth required name="endTime" label={t('end_time_label')} type="time" value={formData.endTime} onChange={handleInputChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth required><InputLabel>{t('type_label')}</InputLabel><Select name="type" value={formData.type} label={t('type_label')} onChange={handleInputChange}>{activityTypeKeys.map(typeKey => <MenuItem key={typeKey} value={typeKey}>{t(`type_${typeKey}`)}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth name="group" label={t('group_label')} value={formData.group} onChange={handleInputChange} helperText={t('group_helper_text')} /></Grid>
            <Grid item xs={12} sm={4}><FormControl fullWidth required><InputLabel>{t('academic_year_label')}</InputLabel><Select name="academicYear" value={formData.academicYear} label={t('academic_year_label')} onChange={handleInputChange}>{academicYears.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12} sm={4}><FormControl fullWidth required disabled={!!selectedCourseDetails}><InputLabel>{t('semester_label')}</InputLabel><Select name="semester" value={formData.semester} label={t('semester_label')} onChange={handleInputChange}>{semesterKeys.map(s => <MenuItem key={s} value={s}>{t(`semester_${s}`)}</MenuItem>)}</Select></FormControl></Grid>
          </Grid>
          <Button type="submit" variant="contained" sx={{ mt: 3 }}>{t('add_entry_button')}</Button>
        </Box>
      </Paper>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('course_label')}</TableCell><TableCell>{t('room_label')}</TableCell><TableCell>{t('day_of_week_label')}</TableCell>
                <TableCell>{t('time_slot_label')}</TableCell><TableCell>{t('type_label')}</TableCell><TableCell>{t('group_label')}</TableCell>
                <TableCell align="center">{t('actions_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedule.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>{entry.course?.name || 'N/A'}</TableCell><TableCell>{entry.room?.name || 'N/A'}</TableCell>
                  <TableCell>{t(`day_${entry.dayOfWeek}`)}</TableCell><TableCell>{`${entry.startTime} - ${entry.endTime}`}</TableCell>
                  <TableCell>{t(`type_${entry.type}`)}</TableCell><TableCell>{entry.group || t('all_groups')}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleDelete(entry._id)}><DeleteIcon /></IconButton>
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

export default ScheduleManagement;