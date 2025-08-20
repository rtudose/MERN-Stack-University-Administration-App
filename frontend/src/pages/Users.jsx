// src/pages/Users.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPaginatedUsers, createUser, updateUser, deleteUser, getStudentRegistrationStats } from '../services/userService';
import BackButton from '../components/BackButton';
import StudentRegistrationChart from '../components/charts/StudentRegistrationChart';
import PaginatedTable from '../components/common/PaginatedTable';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack, IconButton,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Users = () => {
  const { t } = useTranslation();
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const initialState = {
    username: '', email: '', password: '', role: 'student',
    studentDetails: { yearOfStudy: 1, specialization: '', group: '' }
  };
  const [formData, setFormData] = useState(initialState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['yearOfStudy', 'specialization', 'group'].includes(name)) {
      setFormData(prev => ({ ...prev, studentDetails: { ...prev.studentDetails, [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentUserId(null);
    setFormData(initialState);
  };
  
  const getTranslatedError = (msg) => {
    if (msg.includes('is shorter than the minimum allowed length')) return t('password_minlength_error');
    if (msg.includes('Please fill a valid email address')) return t('email_invalid_error');
    if (msg.includes('username already exists')) return t('username_exists_error');
    if (msg.includes('email already exists')) return t('user_exists_error');
    switch (msg) {
      case 'Cannot remove the last administrator': return t('cannot_remove_last_admin');
      case 'You cannot delete your own account': return t('cannot_delete_self');
      default: return t('generic_error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ text: '', type: '' });
    if (!formData.email.trim() || !formData.username.trim() || (!isEditing && !formData.password)) {
        setFormMessage({ text: 'form_error_all_fields', type: 'error' });
        return;
    }
    if (formData.role === 'student' && (!formData.studentDetails.specialization.trim() || !formData.studentDetails.group.trim())) {
        setFormMessage({ text: 'form_error_all_fields', type: 'error' });
        return;
    }

    try {
      const payload = { ...formData };
      if (payload.role !== 'student') {
        delete payload.studentDetails;
      }
      
      if (isEditing) {
        const { username, email, role, studentDetails } = payload;
        await updateUser(currentUserId, { username, email, role, studentDetails });
        setFormMessage({ text: 'user_updated_success', type: 'success' });
      } else {
        await createUser(payload);
        setFormMessage({ text: 'user_created_success', type: 'success' });
      }
      resetForm();
      setRefreshKey(oldKey => oldKey + 1);
    } catch (err) {
      const errorText = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : t('generic_error');
      setFormMessage({ text: errorText, type: 'error' });
    }
  };

  const handleEditClick = (user) => {
    setFormMessage({ text: '', type: '' });
    setIsEditing(true);
    setCurrentUserId(user._id);
    setFormData({
      username: user.username, email: user.email, password: '', role: user.role,
      studentDetails: user.studentDetails || { yearOfStudy: 1, specialization: '', group: '' }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setUserToDelete(null);
  };
  
  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete._id);
        setFormMessage({ text: 'user_deleted_success', type: 'success' });
        setRefreshKey(oldKey => oldKey + 1);
      } catch (err) {
        const errorText = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : t('delete_user_error');
        setFormMessage({ text: errorText, type: 'error' });
      }
    }
    handleCloseDeleteModal();
  };

  const userColumns = [
    { id: 'username', label: 'username_label', sortable: true },
    { id: 'email', label: 'email_label', sortable: true },
    { id: 'role', label: 'role_label', sortable: true, renderCell: (row) => t(`role_label_${row.role}`) },
    { id: 'studentDetails.yearOfStudy', label: 'course_year_label', sortable: true, renderCell: (row) => row.studentDetails?.yearOfStudy || 'N/A' },
    { id: 'studentDetails.specialization', label: 'course_specialization_label', sortable: true, renderCell: (row) => row.studentDetails?.specialization || 'N/A' },
    { id: 'studentDetails.group', label: 'user_group_label', sortable: true, renderCell: (row) => row.studentDetails?.group || 'N/A' },
    {
      id: 'actions',
      label: 'actions_label',
      align: 'center',
      renderCell: (row) => (
        <>
          <IconButton onClick={() => handleEditClick(row)} color="primary"><EditIcon /></IconButton>
          <IconButton onClick={() => handleDeleteClick(row)} color="error"><DeleteIcon /></IconButton>
        </>
      )
    }
  ];

  return (
    <Container 
      maxWidth="xl" 
      sx={{ pt: 2, pb: 4, display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <BackButton />
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          {t('users_management_title')}
        </Typography>
        {formMessage.text && <Alert severity={formMessage.type} sx={{ mb: 2 }} onClose={() => setFormMessage({ text: '', type: '' })}>{t(formMessage.text)}</Alert>}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
                variant="outlined"
                onClick={() => setShowStats(prev => !prev)}
            >
                {showStats ? t('hide_student_stats') : t('show_student_stats')}
            </Button>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
            {isEditing ? t('edit_user_title') : t('add_new_user_title')}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2} sx={{ width: '100%' }}>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth required name="username" label={t('username_label')} value={formData.username} onChange={handleInputChange} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth required name="email" label={t('email_label')} type="email" value={formData.email} onChange={handleInputChange} /></Grid>
              {!isEditing && (<Grid size={{ xs: 12, md: 6 }}><TextField fullWidth required name="password" label={t('password_label')} type="password" value={formData.password} onChange={handleInputChange} inputProps={{ minLength: 6 }} /></Grid>)}
              <Grid size={{ xs: 12, md: isEditing ? 12 : 6 }}>
                <FormControl fullWidth required>
                  <InputLabel id="role-select-label">{t('role_label')}</InputLabel>
                  <Select labelId="role-select-label" name="role" value={formData.role} label={t('role_label')} onChange={handleInputChange}>
                    <MenuItem value="student">{t('role_label_student')}</MenuItem>
                    <MenuItem value="admin">{t('role_label_admin')}</MenuItem>
                    <MenuItem value="teacher">{t('role_label_teacher')}</MenuItem>
                    <MenuItem value="external_representative">{t('role_label_external_representative')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.role === 'student' && (
                <>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth required>
                      <InputLabel id="year-select-label">{t('course_year_label')}</InputLabel>
                      <Select labelId="year-select-label" name="yearOfStudy" value={formData.studentDetails.yearOfStudy} label={t('course_year_label')} onChange={handleInputChange}>
                          <MenuItem value={1}>1</MenuItem><MenuItem value={2}>2</MenuItem><MenuItem value={3}>3</MenuItem><MenuItem value={4}>4</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth required name="specialization" label={t('course_specialization_label')} value={formData.studentDetails.specialization} onChange={handleInputChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth required name="group" label={t('user_group_label')} value={formData.studentDetails.group} onChange={handleInputChange} />
                  </Grid>
                </>
              )}
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button type="submit" variant="contained">{isEditing ? t('update_user_button') : t('add_user_button')}</Button>
              {isEditing && (<Button variant="outlined" onClick={resetForm}>{t('cancel_button')}</Button>)}
            </Stack>
          </Box>
        </Paper>
      </Box>
      
      {showStats && <StudentRegistrationChart />}

      <PaginatedTable
        columns={userColumns}
        fetchDataFunction={getPaginatedUsers}
        refreshKey={refreshKey}
        titleKey="existing_users_title"
      />
      
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <DialogTitle>{t('delete_user_modal_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('delete_user_modal_content', { username: userToDelete?.username || '' })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>{t('cancel_button')}</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            {t('confirm_delete_button')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;