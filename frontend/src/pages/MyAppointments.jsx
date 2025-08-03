// src/pages/MyAppointments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyAppointments } from '../services/appointmentService';
import BackButton from '../components/BackButton';
import { format } from 'date-fns';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert
} from '@mui/material';

const MyAppointments = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyAppointments();
      setAppointments(response.data);
    } catch (err) {
      setError('fetch_appointments_error'); // Reusing a key, but you can create a specific one
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('my_appointments_title')}
      </Typography>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('status_label')}</TableCell>
                <TableCell>{t('date_label')}</TableCell>
                <TableCell>{t('time_slot_label')}</TableCell>
                <TableCell>{t('request_type_label')}</TableCell>
                <TableCell>{t('secretariat_notes_label')}</TableCell>
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
                  <TableRow key={appt._id}>
                    <TableCell>{getStatusChip(appt.status)}</TableCell>
                    <TableCell>{format(new Date(appt.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{`${appt.startTime} - ${appt.endTime}`}</TableCell>
                    <TableCell>{t(`request_${appt.typeOfRequest.replace(/\s/g, '_')}`)}</TableCell>
                    <TableCell>{appt.secretariatNotes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default MyAppointments;