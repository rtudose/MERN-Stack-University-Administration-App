// src/pages/MyAppointments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyAppointments, cancelMyAppointment, markMyAppointmentsAsRead } from '../services/appointmentService';
import BackButton from '../components/BackButton';
import { format } from 'date-fns';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert, IconButton,
  Tooltip, Box, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Button
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const MyAppointments = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyAppointments();
      setAppointments(response.data);
    } catch (err) {
      setError('fetch_appointments_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location.state?.highlightedId) {
      const { highlightedId } = location.state;
      setHighlightedId(highlightedId);

      navigate(location.pathname, { replace: true });

      const timer = setTimeout(() => setHighlightedId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    fetchAppointments();
    markMyAppointmentsAsRead().catch(err => console.error("Failed to mark appointments as read", err));
  }, [fetchAppointments]);

  const openCancelModal = (appointment) => {
    setAppointmentToCancel(appointment);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setAppointmentToCancel(null);
    setCancelModalOpen(false);
  };

  const handleConfirmCancel = async () => {
    if (appointmentToCancel) {
      try {
        await cancelMyAppointment(appointmentToCancel._id);
        fetchAppointments();
      } catch (err) {
        console.error("Failed to cancel appointment", err);
      }
    }
    closeCancelModal();
  };

  const getStatusChip = (status, notes) => {
    const color = {
      pending: 'warning', confirmed: 'success',
      completed: 'primary', cancelled: 'error',
    }[status];

    if (status === 'cancelled' && notes) {
      return (
        <Tooltip
          title={notes}
          arrow
          slotProps={{
            tooltip: {
              sx: {
                fontSize: '1rem',
                lineHeight: 1.6,
                p: 1
              }
            }
          }}
        >
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t(`appointment_status_${status}`)}
                <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
              </Box>
            }
            color="error"
            size="small"
            sx={{ animation: 'subtleBounce 2s infinite ease-in-out' }}
          />
        </Tooltip>
      );
    }

    return <Chip label={t(`appointment_status_${status}`)} color={color || 'default'} size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton to="/dashboard" />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('my_appointments_title')}
      </Typography>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('status_label')}</TableCell>
                <TableCell>{t('date_label')}</TableCell>
                <TableCell>{t('time_slot_label')}</TableCell>
                <TableCell>{t('request_type_label')}</TableCell>
                <TableCell align="center">{t('actions_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {t('no_reservations_found')}
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appt) => (
                  <TableRow
                    key={appt._id}
                    sx={{
                      ...(appt._id === highlightedId && {
                        animation: `highlightFade 3s ease-in-out`,
                      }),
                    }}
                  >
                    <TableCell>{getStatusChip(appt.status, appt.secretariatNotes)}</TableCell>
                    <TableCell>{format(new Date(appt.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{`${appt.startTime} - ${appt.endTime}`}</TableCell>
                    <TableCell>{t(`request_${appt.typeOfRequest.replace(/\s/g, '_')}`)}</TableCell>
                    <TableCell align="center">
                      {(appt.status === 'pending' || appt.status === 'confirmed') && (
                        <Tooltip title={t('cancel_button')}>
                          <IconButton color="error" onClick={() => openCancelModal(appt)}>
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={cancelModalOpen} onClose={closeCancelModal}>
        <DialogTitle>{t('cancel_appointment_modal_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('cancel_appointment_confirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelModal}>{t('no_button')}</Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained">
            {t('yes_cancel_button')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyAppointments;