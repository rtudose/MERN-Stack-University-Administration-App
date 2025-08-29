// src/pages/MyReservations.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyReservations } from '../services/reservationService';
import BackButton from '../components/BackButton';
import { format } from 'date-fns';

import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Alert, Tooltip,
  Box
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const MyReservations = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);

  useEffect(() => {
    if (location.state?.highlightedId) {
      const { highlightedId } = location.state;
      setHighlightedId(highlightedId);
      
      navigate(location.pathname, { replace: true });

      const timer = setTimeout(() => setHighlightedId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate]);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyReservations();
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

  const getStatusChip = (status, notes) => {
    const color = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default',
    }[status];
    
    if (status === 'rejected' && notes) {
      return (
        <Tooltip title={notes} arrow>
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t(`status_${status}`)}
                <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
              </Box>
            }
            color="error"
            size="small"
            sx={{
              animation: 'subtleBounce 2s infinite ease-in-out',
            }}
          />
        </Tooltip>
      );
    }
    
    return <Chip label={t(`status_${status}`)} color={color || 'default'} size="small" />;
  };

  if (loading) return <div>{t('loading_reservations')}</div>;
  if (error) return <Alert severity="error">{t(error)}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('my_reservations_title')}
      </Typography>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table stickyHeader>
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
                  <TableRow
                    key={res._id}
                    sx={{
                      ...(res._id === highlightedId && {
                        animation: `highlightFade 3s ease-in-out`,
                      }),
                    }}
                  >
                    <TableCell>{getStatusChip(res.status, res.adminNotes)}</TableCell>
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