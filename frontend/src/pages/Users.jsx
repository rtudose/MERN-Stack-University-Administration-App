// src/pages/Users.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';
import BackButton from '../components/BackButton';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const initialState = {
    username: '', email: '', password: '', role: 'student',
    studentDetails: { yearOfStudy: 1, specialization: '', group: '' }
  };
  const [formData, setFormData] = useState(initialState);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(t('fetch_users_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['yearOfStudy', 'specialization', 'group'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        studentDetails: { ...prev.studentDetails, [name]: value }
      }));
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
        setFormMessage({ text: t('form_error_all_fields'), type: 'error' });
        return;
    }
    if (formData.role === 'student' && (!formData.studentDetails.specialization.trim() || !formData.studentDetails.group.trim())) {
        setFormMessage({ text: t('form_error_all_fields'), type: 'error' });
        return;
    }

    try {
      const payload = { ...formData };
      if (payload.role !== 'student') {
        delete payload.studentDetails;
      }
      
      if (isEditing) {
        // Only send fields that can be updated
        const { username, email, role, studentDetails } = payload;
        await updateUser(currentUserId, { username, email, role, studentDetails });
        setFormMessage({ text: t('user_updated_success'), type: 'success' });
      } else {
        await createUser(payload);
        setFormMessage({ text: t('user_created_success'), type: 'success' });
      }
      resetForm();
      fetchUsers();
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

  const handleDeleteClick = async (userId) => {
    if (window.confirm(t('delete_user_confirm'))) {
      try {
        await deleteUser(userId);
        setFormMessage({ text: t('user_deleted_success'), type: 'success' });
        fetchUsers();
      } catch (err) {
        const errorText = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : t('delete_user_error');
        setFormMessage({ text: errorText, type: 'error' });
      }
    }
  };

  if (loading) return <div>{t('loading_users')}</div>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('users_management_title')}
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEditing ? t('edit_user_title') : t('add_new_user_title')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth required name="username" label={t('username_label')} value={formData.username} onChange={handleInputChange} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth required name="email" label={t('email_label')} type="email" value={formData.email} onChange={handleInputChange} /></Grid>
            {!isEditing && (<Grid item xs={12} md={6}><TextField fullWidth required name="password" label={t('password_label')} type="password" value={formData.password} onChange={handleInputChange} inputProps={{ minLength: 6 }} /></Grid>)}
            <Grid item xs={12} md={isEditing ? 12 : 6}>
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
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel id="year-select-label">{t('course_year_label')}</InputLabel>
                    <Select labelId="year-select-label" name="yearOfStudy" value={formData.studentDetails.yearOfStudy} label={t('course_year_label')} onChange={handleInputChange}>
                        <MenuItem value={1}>1</MenuItem><MenuItem value={2}>2</MenuItem><MenuItem value={3}>3</MenuItem><MenuItem value={4}>4</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth required name="specialization" label={t('course_specialization_label')} value={formData.studentDetails.specialization} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={12} md={4}>
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
        {formMessage.text && <Alert severity={formMessage.type} sx={{ mt: 2 }}>{t(formMessage.text)}</Alert>}
      </Paper>
      
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" component="h2" gutterBottom>{t('existing_users_title')}</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('username_label')}</TableCell><TableCell>{t('email_label')}</TableCell><TableCell>{t('role_label')}</TableCell>
                <TableCell>{t('course_year_label')}</TableCell><TableCell>{t('course_specialization_label')}</TableCell><TableCell>{t('user_group_label')}</TableCell>
                <TableCell align="center">{t('actions_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell><TableCell>{user.email}</TableCell><TableCell>{t(`role_label_${user.role}`)}</TableCell>
                  <TableCell>{user.studentDetails?.yearOfStudy || 'N/A'}</TableCell><TableCell>{user.studentDetails?.specialization || 'N/A'}</TableCell>
                  <TableCell>{user.studentDetails?.group || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditClick(user)} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteClick(user._id)} color="error"><DeleteIcon /></IconButton>
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

export default Users;