// src/pages/Users.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getPaginatedUsers, createUser, updateUser, deleteUser, getStudentRegistrationStats } from '../services/userService';
import BackButton from '../components/BackButton';
import StudentRegistrationChart from '../components/charts/StudentRegistrationChart';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Select, MenuItem, FormControl, InputLabel, TableSortLabel, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Pagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });

  // 2. New state for pagination details, with a default limit
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');

  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const initialState = {
    username: '', email: '', password: '', role: 'student',
    studentDetails: { yearOfStudy: 1, specialization: '', group: '' }
  };
  const [formData, setFormData] = useState(initialState);

  const [showStats, setShowStats] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // 3. fetchUsers is now wrapped in useCallback to be a stable dependency for useEffect
  const fetchUsers = useCallback(async () => {
    try {
      const response = await getPaginatedUsers({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: orderBy,
        order: order,
      });
      setUsers(response.data.data);
      setPagination(prev => ({ ...prev, totalPages: response.data.pagination.totalPages }));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(t('fetch_users_error'));
    }
  }, [pagination.page, pagination.limit, orderBy, order, t]);

  // 4. useEffect now runs whenever sort or pagination state changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      fetchUsers(); // Refresh the table with the latest data
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
        fetchUsers();
      } catch (err) {
        const errorText = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : t('delete_user_error');
        setFormMessage({ text: errorText, type: 'error' });
      }
    }
    handleCloseDeleteModal();
  };

  // 5. This handler now just updates state, triggering the useEffect to refetch
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPagination(prev => ({ ...prev, page: 1 })); // Go back to first page on sort
  };
  
  // 6. New handler for page changes
  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  // The loading state is removed; the table will just show the last fetched data
  if (error) return <Alert severity="error">{error}</Alert>;

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
                onClick={() => setShowStats(prev => !prev)} // 3. The button to toggle the state
            >
                {showStats ? t('hide_student_stats') : t('show_student_stats')}
            </Button>
        </Box>

        {/* The Form Paper remains the same */}
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
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
        </Paper>
      </Box>
      
      {showStats && <StudentRegistrationChart />}

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('existing_users_title')}
        </Typography>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                 {/* TableSortLabel now uses the updated handler */}
                <TableCell sortDirection={orderBy === 'username' ? order : false}>
                  <TableSortLabel active={orderBy === 'username'} direction={order} onClick={() => handleRequestSort('username')}>
                    {t('username_label')}
                  </TableSortLabel>

                </TableCell>
                <TableCell sortDirection={orderBy === 'email' ? order : false}>
                  <TableSortLabel active={orderBy === 'email'} direction={order} onClick={() => handleRequestSort('email')}>
                    {t('email_label')}
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'role' ? order : false}>
                  <TableSortLabel active={orderBy === 'role'} direction={order} onClick={() => handleRequestSort('role')}>
                    {t('role_label')}
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'studentDetails.yearOfStudy' ? order : false}>
                  <TableSortLabel active={orderBy === 'studentDetails.yearOfStudy'} direction={order} onClick={() => handleRequestSort('studentDetails.yearOfStudy')}>
                    {t('course_year_label')}
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === 'studentDetails.specialization' ? order : false}>
                  <TableSortLabel active={orderBy === 'studentDetails.specialization'} direction={order} onClick={() => handleRequestSort('studentDetails.specialization')}>
                      {t('course_specialization_label')}
                  </TableSortLabel>
                </TableCell>
                
                <TableCell sortDirection={orderBy === 'studentDetails.group' ? order : false}>
                  <TableSortLabel active={orderBy === 'studentDetails.group'} direction={order} onClick={() => handleRequestSort('studentDetails.group')}>
                      {t('user_group_label')}
                  </TableSortLabel>
                </TableCell>

                <TableCell align="center">{t('actions_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* 7. The complex useMemo for sorting is gone. We map directly over 'users'. */}
              {users.map((user) => (
                <TableRow hover key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{t(`role_label_${user.role}`)}</TableCell>
                  <TableCell >{user.studentDetails?.yearOfStudy || 'N/A'}</TableCell>
                  <TableCell>{user.studentDetails?.specialization || 'N/A'}</TableCell>
                  <TableCell>{user.studentDetails?.group || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditClick(user)} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteClick(user)} color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* 8. Add the Pagination component */}
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
            />
        </Box>
      </Paper>
      
      {/* The Delete Dialog remains the same */}
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