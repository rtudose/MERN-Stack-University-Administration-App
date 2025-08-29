// src/pages/ScheduleManagement.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createScheduleEntry, deleteScheduleEntry, updateScheduleEntry, getPaginatedSchedule } from '../services/scheduleService';
import PaginatedTable from '../components/common/PaginatedTable';
import { format } from 'date-fns';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import CourseAutocomplete from '../components/common/CourseAutocomplete';
import RoomAutocomplete from '../components/common/RoomAutocomplete';
import ProfessorWorkloadList from '../components/charts/ProfessorWorkloadList';
import BackButton from '../components/BackButton';
import {
  Container, Typography, Paper, IconButton, Alert, Box, Grid, FormControl,
  InputLabel, Select, MenuItem, TextField, Button, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const dayOfWeekKeys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const academicYears = ['2024-2025', '2025-2026'];
const semesterKeys = [1, 2];
const activityTypeKeys = ['Lecture', 'Lab', 'Seminar', 'Practice'];

const setTimeToDate = (hours, minutes) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};
const parseTimeString = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return setTimeToDate(hours, minutes);
};

const ScheduleManagement = () => {
  const { t } = useTranslation();
  const [formMessage, setFormMessage] = useState({ key: '', options: {}, type: 'success' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState(null);

  const initialState = {
    course: '', room: '', dayOfWeek: dayOfWeekKeys[0], startTime: setTimeToDate(8, 0), 
    endTime: setTimeToDate(10, 0), type: activityTypeKeys[0], group: '',
    academicYear: academicYears[0], semester: semesterKeys[0]
  };
  const [formData, setFormData] = useState(initialState);

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
  
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedCourseDetails(course);
    setFormData(prev => ({ ...prev, course: course ? course._id : '', semester: course ? course.semester : 1 }));
  };
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setSelectedRoomDetails(room);
    setFormData(prev => ({ ...prev, room: room ? room._id : '' }));
  };

  const resetForm = () => {
      setIsEditing(false);
      setCurrentEntryId(null);
      setSelectedCourse(null);
      setSelectedRoom(null);
      setSelectedCourseDetails(null);
      setSelectedRoomDetails(null);
      setFormData(initialState);
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
    setFormMessage({ key: '', type: '' });

    const { course, room, dayOfWeek, startTime, endTime, type, academicYear, semester } = formData;
    if (!course || !room || !dayOfWeek || !startTime || !endTime || !type || !academicYear || !semester) {
        setFormMessage({ key: 'form_error_all_fields', type: 'error' });
        return;
    }

    const payload = {
      ...formData,
      startTime: format(formData.startTime, 'HH:mm'),
      endTime: format(formData.endTime, 'HH:mm'),
    };

    try {
      if (isEditing) {
        await updateScheduleEntry(currentEntryId, payload);
        setFormMessage({ key: 'schedule_entry_updated_success', type: 'success' });
      } else {
        await createScheduleEntry(payload);
        setFormMessage({ key: 'schedule_entry_created_success', type: 'success' });
      }
      resetForm();
      setRefreshKey(k => k + 1);
    } catch (err) {
      const errorData = err.response?.data;
      if (['PROFESSOR_OVERLAP', 'ROOM_OVERLAP', 'COURSE_OVERLAP', 'STUDENT_GROUP_OVERLAP'].includes(errorData?.msg)) {
        let errorKey = `${errorData.msg.toLowerCase()}_error`;
        if (errorData.msg === 'STUDENT_GROUP_OVERLAP' && errorData.details?.type) {
          errorKey = `student_group_overlap_error_${errorData.details.type}`;
        }
        setFormMessage({ key: errorKey, type: 'error', details: errorData.details });
      } else {
        const errorText = getTranslatedError(errorData?.msg);
        setFormMessage({ key: errorText, type: 'error', details: null });
      }
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm(t('delete_schedule_entry_confirm'))) {
        try {
            await deleteScheduleEntry(id);
            setFormMessage({ key: 'schedule_entry_deleted_success', type: 'success' });
            setRefreshKey(k => k + 1);
        } catch (err) {
            setFormMessage({ key: 'generic_error', type: 'error' });
        }
    }
  };

  const handleStartTimeChange = (newTime) => {
    setFormData(prev => ({ ...prev, startTime: newTime }));
  };
  const handleEndTimeChange = (newTime) => {
    setFormData(prev => ({ ...prev, endTime: newTime }));
  };

  const handleEditClick = (entry) => {
    setFormMessage({ key: '', type: '' });
    setIsEditing(true);
    setCurrentEntryId(entry._id);
    setSelectedCourseDetails(entry.course);
    setSelectedRoomDetails(entry.room);
    setFormData({
        course: entry.course._id,
        room: entry.room._id,
        dayOfWeek: entry.dayOfWeek,
        startTime: parseTimeString(entry.startTime),
        endTime: parseTimeString(entry.endTime),
        type: entry.type,
        group: entry.group || '',
        academicYear: entry.academicYear,
        semester: entry.semester
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const scheduleColumns = [
    { id: 'course.name', label: 'course_label', sortable: true, renderCell: (row) => (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{row.course?.name || 'N/A'}</Typography>
        <Typography variant="caption" color="text.secondary">{row.course?.code || ''}</Typography>
      </Box>
    )},
    { id: 'type', label: 'type_label', sortable: true, renderCell: (row) => t(`type_${row.type}`) },
    { id: 'room.name', label: 'room_label', sortable: true, renderCell: (row) => row.room?.name || 'N/A' },
    { id: 'dayOfWeek', label: 'day_of_week_label', sortable: true, renderCell: (row) => t(`day_${row.dayOfWeek}`) },
    { id: 'startTime', label: 'time_slot_label', sortable: true, renderCell: (row) => `${row.startTime} - ${row.endTime}` },
    { id: 'group', label: 'group_label', sortable: true, renderCell: (row) => row.group || t('all_groups') },
    { id: 'actions', label: 'actions_label', align: 'center', renderCell: (row) => (
      <>
        <IconButton color="primary" onClick={() => handleEditClick(row)}><EditIcon /></IconButton>
        <IconButton color="error" onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
      </>
    )}
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('schedule_management_title')}
      </Typography>
      {formMessage.key && 
        <Alert 
          severity={formMessage.type} 
          sx={{ mb: 2 }} 
          onClose={() => setFormMessage({ key: '', type: '' })}
        >
          {t(formMessage.key, { 
            ...formMessage.details, 
            dayOfWeek: formMessage.details?.dayOfWeek ? t(`day_${formMessage.details.dayOfWeek}`) : ''
          })}
        </Alert>
      }

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button variant="outlined" onClick={() => setShowStats(prev => !prev)}>
          {showStats ? t('hide_professor_stats') : t('show_professor_stats')}
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
          {isEditing ? t('edit_entry_button') : t('add_schedule_entry_title')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CourseAutocomplete value={selectedCourse} onChange={handleCourseSelect} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RoomAutocomplete value={selectedRoom} onChange={handleRoomSelect} />
            </Grid>

            {(selectedCourseDetails || selectedRoomDetails) && (
              <Grid size={ 12 }>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Grid container spacing={2} sx={{ width: '100%' }}>
                        {selectedCourseDetails && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" gutterBottom>{t('course_details_label')}</Typography>
                                <Stack direction="row" spacing={3}>
                                    <TextField label={t('course_year_label')} value={selectedCourseDetails.yearOfStudy} InputProps={{ readOnly: true }} variant="standard" />
                                    <TextField label={t('course_specialization_label')} value={selectedCourseDetails.specialization} InputProps={{ readOnly: true }} variant="standard" />
                                </Stack>
                            </Grid>
                        )}
                        {selectedRoomDetails && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" gutterBottom>{t('room_details_label')}</Typography>
                                <Stack direction="row" spacing={3}>
                                    <TextField label={t('room_capacity_label')} value={selectedRoomDetails.capacity} InputProps={{ readOnly: true }} variant="standard" />
                                    <TextField 
                                      label={t('equipment_label')} 
                                      value={(selectedRoomDetails.equipment || []).map(key => t(`equipment_${key}`)).join(', ') || t('none')} 
                                      InputProps={{ readOnly: true }} 
                                      variant="standard" 
                                      fullWidth
                                    />
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth required><InputLabel>{t('day_of_week_label')}</InputLabel><Select name="dayOfWeek" value={formData.dayOfWeek} label={t('day_of_week_label')} onChange={handleInputChange}>{dayOfWeekKeys.map(d => <MenuItem key={d} value={d}>{t(`day_${d}`)}</MenuItem>)}</Select></FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TimePicker
                label={t('start_time_label')}
                value={formData.startTime}
                onChange={handleStartTimeChange}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TimePicker
                label={t('end_time_label')}
                value={formData.endTime}
                onChange={handleEndTimeChange}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth required><InputLabel>{t('type_label')}</InputLabel><Select name="type" value={formData.type} label={t('type_label')} onChange={handleInputChange}>{activityTypeKeys.map(typeKey => <MenuItem key={typeKey} value={typeKey}>{t(`type_${typeKey}`)}</MenuItem>)}</Select></FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth name="group" label={t('group_label')} value={formData.group} onChange={handleInputChange} helperText={t('group_helper_text')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required><InputLabel>{t('academic_year_label')}</InputLabel><Select name="academicYear" value={formData.academicYear} label={t('academic_year_label')} onChange={handleInputChange}>{academicYears.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}</Select></FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth required disabled={!!selectedCourseDetails}><InputLabel>{t('semester_label')}</InputLabel><Select name="semester" value={formData.semester} label={t('semester_label')} onChange={handleInputChange}>{semesterKeys.map(s => <MenuItem key={s} value={s}>{t(`semester_${s}`)}</MenuItem>)}</Select></FormControl>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained">
              {isEditing ? t('update_entry_button') : t('add_entry_button')}
            </Button>
            {isEditing && (
              <Button variant="outlined" onClick={resetForm}>
                {t('cancel_button')}
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
      
      {showStats && <ProfessorWorkloadList />}

      <PaginatedTable
        columns={scheduleColumns}
        fetchDataFunction={getPaginatedSchedule}
        refreshKey={refreshKey}
        titleKey="schedule_table_title"
      />
    </Container>
  );
};

export default ScheduleManagement;