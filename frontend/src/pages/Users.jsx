// src/pages/Users.jsx (Polished Version)
import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';
import BackButton from '../components/BackButton';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Select, MenuItem, FormControl, InputLabel, TableSortLabel, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme, alpha, lighten } from '@mui/material/styles';
import { useExternalScrollbarSync } from '../hooks/useExternalScrollbarSync';

// Helper for sorting
function descendingComparator(a, b, orderBy) {
  let valA = a[orderBy];
  let valB = b[orderBy];
  if (orderBy === 'yearOfStudy') valA = a.studentDetails?.yearOfStudy;
  if (orderBy === 'yearOfStudy') valB = b.studentDetails?.yearOfStudy;

  if (valB < valA) { return -1; }
  if (valB > valA) { return 1; }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}


const Users = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const thumbColor = primary;
  const thumbHover = lighten(primary, 0.1);
  const thumbActive = lighten(primary, 0.2);
  const trackColor = theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.35)' : 'transparent';
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
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Column widths to avoid content overlap and keep a clean layout
  const COLS = useMemo(() => ({
    username: '22%',
    email: '30%',
    role: '12%',
    year: '8%',
    spec: '16%',
    group: '6%',
    actions: '6%'
  }), []);
  const cellTruncateSx = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

  // Track overflow and sync via reusable hook
  const usersScrollRef = useRef(null);
  const {
    nativeRef: hookSetUsersScrollNode,
    proxyRef: hookSetUsersProxyNode,
    frameRef: hookSetUsersFrameNode,
    hasOverflow: usersHasVOverflow,
    ghostHeight,
    effectiveScrollbarWidth: usersScrollbarEffective,
    forceAlign,
    recalculate,
    metrics,
  } = useExternalScrollbarSync({ deps: [users.length, order, orderBy, i18n.language] });
  const setUsersScrollNode = useCallback((node) => { usersScrollRef.current = node; hookSetUsersScrollNode(node); }, [hookSetUsersScrollNode]);
  const setProxyScrollNode = useCallback((node) => { hookSetUsersProxyNode(node); }, [hookSetUsersProxyNode]);
  const setUsersFrameNode = useCallback((node) => { hookSetUsersFrameNode(node); }, [hookSetUsersFrameNode]);
  const OUTER_GAP = 6; // 2px frame + 4px visual gap
  const PROXY_EXTRA = 4; // add a few px to make the proxy thumb easier to see/grab
  const proxyWidth = usersScrollbarEffective + PROXY_EXTRA;

  // Measurement handled by useExternalScrollbarSync

  // Overflow tracking handled by useExternalScrollbarSync

  // Overflow re-evaluation handled by useExternalScrollbarSync (deps include data/sort/lang)

  // Two-way sync handled by useExternalScrollbarSync

  // rAF fallback handled by useExternalScrollbarSync

  // Ghost height creation handled by useExternalScrollbarSync

  // After data mutations/sort/language changes, force-align once
  useEffect(() => { forceAlign(); }, [forceAlign, users.length, order, orderBy, i18n.language]);

  // Ensure layout is re-measured after data and sorting/language changes (e.g., after deletions)
  useEffect(() => {
    recalculate();
    const id = requestAnimationFrame(() => recalculate());
    return () => cancelAnimationFrame(id);
  }, [recalculate, users.length, order, orderBy, i18n.language]);

  // Native scrollbar measurement handled by useExternalScrollbarSync

  // When role toggles, the form above expands/collapses; force a recalculation immediately and on next frame
  useEffect(() => {
    recalculate();
    const id = requestAnimationFrame(() => recalculate());
    return () => cancelAnimationFrame(id);
  }, [formData.role, recalculate]);

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

  // Disable app/page scroll: lock <html>, <body>, and the app's <main> container
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const mainEl = document.querySelector('main');
    const prevMainOverflow = mainEl ? mainEl.style.overflow : undefined;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (mainEl) mainEl.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      if (mainEl && typeof prevMainOverflow !== 'undefined') mainEl.style.overflow = prevMainOverflow;
    };
  }, []);

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
    setFormMessage({ text: '', type: '' });
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
        setFormMessage({ text: t('user_deleted_success'), type: 'success' });
        fetchUsers();
      } catch (err) {
        const errorText = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : t('delete_user_error');
        setFormMessage({ text: errorText, type: 'error' });
      }
    }
    handleCloseDeleteModal();
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const sortedUsers = useMemo(() => {
    const roleOrder = { admin: 1, teacher: 2, external_representative: 3, student: 4 };

    const getSortValue = (item, property) => {
        switch (property) {
            case 'yearOfStudy': return item.studentDetails?.yearOfStudy || 0;
            case 'specialization': return item.studentDetails?.specialization || '';
            case 'group': return item.studentDetails?.group || '';
            case 'role': return roleOrder[item.role] || 99;
            default: return item[property] || '';
        }
    };
    return [...users].sort((a, b) => {
        const valA = getSortValue(a, orderBy);
        const valB = getSortValue(b, orderBy);
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });
  }, [users, order, orderBy]);

  if (loading) return <div>{t('loading_users')}</div>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        pt: 2, pb: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 112px)', 
        overflow: 'visible',
        minHeight: 0,
      }}
    >
      {/* --- Top Section (Form, Title, etc.) --- */}
      <Box sx={{ flexShrink: 0 }}>
        <BackButton />
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          {t('users_management_title')}
        </Typography>
        {formMessage.text && <Alert severity={formMessage.type} sx={{ mb: 2 }} onClose={() => setFormMessage({ text: '', type: '' })}>{t(formMessage.text)}</Alert>}
        
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
      
      {/* --- Bottom Section (Table) --- */}
      <Paper sx={{ flexGrow: 0, display: 'flex', flexDirection: 'column', overflow: 'visible', p: 2, minHeight: 0, backgroundColor: 'transparent' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('existing_users_title')}
        </Typography>
        {/* Do not reserve extra space in wrapper; handle gutter entirely on the scroll container */}
        <Box ref={setUsersFrameNode} data-users-boundary sx={{ flex: '0 0 auto', position: 'relative', pr: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Box data-users-frame sx={{
            flex: '0 0 auto',
            position: 'relative',
            overflow: 'visible',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: '26px',
            backgroundColor: 'background.paper'
          }}>
          {/* Wrapper should not reduce content width */}
          <Box sx={{ flex: '0 0 auto', minHeight: 0, height: 'auto', display: 'flex', flexDirection: 'column', overflow: 'visible', pr: 0 }}>
          <TableContainer
            key={`users-scroll-${i18n.language}`}
            ref={setUsersScrollNode}
            data-users-scroll
            sx={{
              flex: '0 1 auto',
              minHeight: 0,
              height: 'auto',
              display: 'block',
              position: 'relative',
              right: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              overflowAnchor: 'none',
              contain: 'layout paint',
              width: '100%',
              // Hide the native scrollbar; we'll render a synced proxy outside the frame
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
              '&::-webkit-scrollbar': { width: 0, height: 0 }, // WebKit
              boxSizing: 'content-box',
              pl: 0,
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            <Table stickyHeader sx={{ backgroundColor: 'transparent', width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}>
              <TableHead sx={{
                '& th, & th.MuiTableCell-head': {
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  backgroundColor: 'black.200',
                  backgroundClip: 'padding-box'
                },
                '& th:first-of-type': { borderTopLeftRadius: '26px' },
                '& th:last-of-type': { borderTopRightRadius: '26px' }
              }}>
                <TableRow>
                <TableCell sx={{ width: COLS.username }} sortDirection={orderBy === 'username' ? order : false}><TableSortLabel active={orderBy === 'username'} direction={order} onClick={() => handleRequestSort('username')}>{t('username_label')}</TableSortLabel></TableCell>
                <TableCell sx={{ width: COLS.email }} sortDirection={orderBy === 'email' ? order : false}><TableSortLabel active={orderBy === 'email'} direction={order} onClick={() => handleRequestSort('email')}>{t('email_label')}</TableSortLabel></TableCell>
                <TableCell sx={{ width: COLS.role }} sortDirection={orderBy === 'role' ? order : false}><TableSortLabel active={orderBy === 'role'} direction={order} onClick={() => handleRequestSort('role')}>{t('role_label')}</TableSortLabel></TableCell>
                <TableCell sx={{ width: COLS.year }} sortDirection={orderBy === 'yearOfStudy' ? order : false}><TableSortLabel active={orderBy === 'yearOfStudy'} direction={order} onClick={() => handleRequestSort('yearOfStudy')}>{t('course_year_label')}</TableSortLabel></TableCell>
                <TableCell sx={{ width: COLS.spec }} sortDirection={orderBy === 'specialization' ? order : false}><TableSortLabel active={orderBy === 'specialization'} direction={order} onClick={() => handleRequestSort('specialization')}>{t('course_specialization_label')}</TableSortLabel></TableCell>
                <TableCell sx={{ width: COLS.group }} sortDirection={orderBy === 'group' ? order : false}><TableSortLabel active={orderBy === 'group'} direction={order} onClick={() => handleRequestSort('group')}>{t('user_group_label')}</TableSortLabel></TableCell>
                <TableCell sx={{ width: COLS.actions }} align="center">{t('actions_label')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell sx={{ width: COLS.username }}>
                      <Box sx={{ ...cellTruncateSx, display: 'block', maxWidth: '100%' }}>{user.username}</Box>
                    </TableCell>
                    <TableCell sx={{ width: COLS.email }}>
                      <Box sx={{ ...cellTruncateSx, display: 'block', maxWidth: '100%' }}>{user.email}</Box>
                    </TableCell>
                    <TableCell sx={{ width: COLS.role }}>{t(`role_label_${user.role}`)}</TableCell>
                    <TableCell sx={{ width: COLS.year }}>{user.studentDetails?.yearOfStudy || 'N/A'}</TableCell>
                    <TableCell sx={{ width: COLS.spec }}>{user.studentDetails?.specialization || 'N/A'}</TableCell>
                    <TableCell sx={{ width: COLS.group }}>{user.studentDetails?.group || 'N/A'}</TableCell>
                    <TableCell sx={{ width: COLS.actions }} align="center">
                      <IconButton onClick={() => handleEditClick(user)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteClick(user)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Proxy scrollbar fully outside the frame, synced with the real scroller */}
          {usersHasVOverflow && (
            <Box
              key={`users-proxy-${i18n.language}`}
              ref={setProxyScrollNode}
              data-users-scroll-proxy
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                // Position so that the left edge of the scrollbar sits gap (4px) outside the frame border (2px)
                right: `calc(-${proxyWidth}px - ${OUTER_GAP}px)`,
                width: `${proxyWidth}px`,
                overflowY: 'auto',
                overflowX: 'hidden',
                backgroundColor: 'transparent',
                // ensure it's above the frame background but below header content
                zIndex: 2,
                // Visible scrollbar styling (Chrome, Firefox)
                scrollbarWidth: 'thin',
                scrollbarColor: `${thumbColor} ${trackColor}`,
                '&::-webkit-scrollbar': { width: `${proxyWidth}px` },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: thumbColor,
                  borderRadius: '8px',
                  border: '2px solid transparent',
                  backgroundClip: 'padding-box',
                  minHeight: '32px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: trackColor
                },
                '&:hover::-webkit-scrollbar-thumb': { backgroundColor: thumbHover },
                '&:active::-webkit-scrollbar-thumb': { backgroundColor: thumbActive },
                pointerEvents: 'auto',
                willChange: 'scroll-position'
              }}
            >
              {/* ghost div to create the appropriate scroll range */}
              <Box sx={{ width: 1, height: `${ghostHeight}px` }} />
            </Box>
          )}
          {/* Debug overlay */}
          {process.env.NODE_ENV !== 'production' && metrics && (
            <Box sx={{ position: 'absolute', bottom: 8, left: 8, p: 1, borderRadius: 1, fontSize: 12, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', pointerEvents: 'none' }}>
              has:{String(usersHasVOverflow)} | el:{Math.round(metrics.elScroll)} | avail:{Math.round(metrics.availableClient)} | cap:{Math.round(metrics.capPx || 0)}
            </Box>
          )}
          </Box>
        </Box>
      </Box>
    </Paper>
    {/* Delete Confirmation Modal */}
    <Dialog
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
      >
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