// src/pages/MyReservations.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyReservations } from '../services/reservationService';
import BackButton from '../components/BackButton';
import { format } from 'date-fns';

import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert
} from '@mui/material';

const MyReservations = () => {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyReservations();
      setReservations(response.data);
    } catch (err) {
      setError('fetch_reservations_error'); // Can reuse this key
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

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
        {t('my_reservations_title')}
      </Typography>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('status_label')}</TableCell>
                <TableCell>{t('room_name_label')}</TableCell>
                <TableCell>{t('date_label')}</TableCell>
                <TableCell>{t('time_slot_label')}</TableCell>
                <TableCell>{t('purpose_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {t('no_reservations_found')}
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => (
                  <TableRow key={res._id}>
                    <TableCell>{getStatusChip(res.status)}</TableCell>
                    <TableCell>{res.room?.name || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(res.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{`${res.startTime} - ${res.endTime}`}</TableCell>
                    <TableCell>{res.purpose}</TableCell>
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

export default MyReservations;