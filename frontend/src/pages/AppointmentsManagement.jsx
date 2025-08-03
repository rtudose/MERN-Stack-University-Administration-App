// src/pages/AppointmentsManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllAppointments, updateAppointmentStatus } from '../services/appointmentService';
import BackButton from '../components/BackButton';
import { format } from 'date-fns';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Stack, Alert,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const AppointmentsManagement = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllAppointments();
      setAppointments(response.data);
    } catch (err) {
      setError('fetch_appointments_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (id, status, notes = '') => {
    try {
      await updateAppointmentStatus(id, { status, secretariatNotes: notes });
      setMessage({ text: 'appointment_status_updated', type: 'success' });
      fetchAppointments();
    } catch (err) {
      setMessage({ text: 'generic_error', type: 'error' });
    }
  };

  const handleOpenRejectionModal = (appt) => {
    setCurrentAppointment(appt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAppointment(null);
    setRejectionNotes('');
  };

  const handleRejectionSubmit = () => {
    if(currentAppointment) {
      handleStatusUpdate(currentAppointment._id, 'cancelled', rejectionNotes);
    }
    handleCloseModal();
  };

  const getStatusChip = (status) => {
    const color = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'primary',
      cancelled: 'default',
    }[status];
    return <Chip label={t(`appointment_status_${status}`)} color={color} size="small" />;
  };

  if (loading) return <div>{t('loading_appointments')}</div>;
  if (error) return <Alert severity="error">{t(error)}</Alert>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('appointments_management_title')}
      </Typography>
      {message.text && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ text: '', type: '' })}>{t(message.text)}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('status_label')}</TableCell>
                <TableCell>{t('student_label')}</TableCell>
                <TableCell>{t('date_label')}</TableCell>
                <TableCell>{t('time_slot_label')}</TableCell>
                <TableCell>{t('request_type_label')}</TableCell>
                <TableCell>{t('description_label')}</TableCell>
                <TableCell align="center">{t('actions_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt._id}>
                  <TableCell>{getStatusChip(appt.status)}</TableCell>
                  <TableCell>{appt.student?.username || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(appt.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{`${appt.startTime} - ${appt.endTime}`}</TableCell>
                  <TableCell>{t(`request_${appt.typeOfRequest.replace(/\s/g, '_')}`)}</TableCell>
                  <TableCell>{appt.description}</TableCell>
                  <TableCell align="center">
                    {appt.status === 'pending' && (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton title={t('confirm_button')} color="success" onClick={() => handleStatusUpdate(appt._id, 'confirmed')}><CheckCircleIcon /></IconButton>
                        <IconButton title={t('cancel_button')} color="error" onClick={() => handleOpenRejectionModal(appt)}><CancelIcon /></IconButton>
                      </Stack>
                    )}
                    {appt.status === 'confirmed' && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DoneAllIcon />}
                        onClick={() => handleStatusUpdate(appt._id, 'completed')}
                      >
                        {t('mark_completed_button')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>{t('rejection_reason_title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('rejection_reason_label')}
            type="text"
            fullWidth
            variant="standard"
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('cancel_button')}</Button>
          <Button onClick={handleRejectionSubmit} variant="contained" color="error">{t('submit_rejection_button')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentsManagement;