// src/pages/ReservationsManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllReservations, updateReservationStatus } from '../services/reservationService';
import BackButton from '../components/BackButton';
import { format } from 'date-fns';

import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Stack, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ReservationsManagement = () => {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllReservations();
      setReservations(response.data);
    } catch (err) {
      setError('fetch_reservations_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      setMessage({ text: 'reservation_status_updated', type: 'success' });
      fetchReservations(); // Refresh the list
    } catch (err) {
      setMessage({ text: 'generic_error', type: 'error' });
    }
  };

  const getStatusChip = (status) => {
    const color = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default',
    }[status];

    return <Chip label={t(`status_${status}`)} color={color} size="small" />;
  };

  if (loading) return <div>{t('loading_reservations')}</div>;
  if (error) return <Alert severity="error">{t(error)}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('reservations_management_title')}
      </Typography>
      {message.text && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ text: '', type: '' })}>{t(message.text)}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('status_label')}</TableCell>
                <TableCell>{t('room_name_label')}</TableCell>
                <TableCell>{t('reserved_by_label')}</TableCell>
                <TableCell>{t('date_label')}</TableCell>
                <TableCell>{t('time_slot_label')}</TableCell>
                <TableCell>{t('purpose_label')}</TableCell>
                <TableCell align="center">{t('actions_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((res) => (
                <TableRow key={res._id}>
                  <TableCell>{getStatusChip(res.status)}</TableCell>
                  <TableCell>{res.room?.name || 'N/A'}</TableCell>
                  <TableCell>{res.reservedBy}</TableCell>
                  <TableCell>{format(new Date(res.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{`${res.startTime} - ${res.endTime}`}</TableCell>
                  <TableCell>{res.purpose}</TableCell>
                  <TableCell align="center">
                    {res.status === 'pending' && (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton color="success" onClick={() => handleStatusUpdate(res._id, 'approved')}>
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleStatusUpdate(res._id, 'rejected')}>
                          <CancelIcon />
                        </IconButton>
                      </Stack>
                    )}
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

export default ReservationsManagement;