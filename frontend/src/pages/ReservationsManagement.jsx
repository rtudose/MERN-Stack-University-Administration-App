// src/pages/ReservationsManagement.jsx
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PaginatedTable from '../components/common/PaginatedTable';
import { getPaginatedReservations, updateReservationStatus } from '../services/reservationService';
import BackButton from '../components/BackButton';
import { format } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReservationStatusChart from '../components/charts/ReservationStatusChart';
import {
  Container, Typography, IconButton, Chip, Stack, Alert, Box, Button,
  FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ReservationsManagement = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState({ key: '', type: 'success' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [reservationToUpdate, setReservationToUpdate] = useState(null);

  const openRejectModal = (reservation) => {
    setReservationToUpdate(reservation);
    setRejectModalOpen(true);
  };
  const closeRejectModal = () => {
    setReservationToUpdate(null);
    setRejectionNote('');
    setRejectModalOpen(false);
  };
  const handleConfirmReject = () => {
    if (reservationToUpdate) {
        handleStatusUpdate(reservationToUpdate._id, 'rejected', rejectionNote);
    }
    closeRejectModal();
  };

  const handleStatusUpdate = async (id, status, adminNotes = '') => {
    try {
      await updateReservationStatus(id, status, adminNotes);
      setMessage({ key: 'reservation_status_updated', type: 'success' });
      setRefreshKey(k => k + 1);
    } catch (err) {
      setMessage({ key: 'generic_error', type: 'error' });
    }
  };

  const fetchFilteredData = useCallback((params) => {
    return getPaginatedReservations({ ...params, status: statusFilter });
  }, [statusFilter]);

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setRefreshKey(k => k + 1);
  };

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
            sx={{ animation: 'subtleBounce 2s infinite ease-in-out' }}
          />
        </Tooltip>
      );
    }
    
    return <Chip label={t(`status_${status}`)} color={color || 'default'} size="small" />;
  };

  const reservationColumns = [
    { id: 'status', label: 'status_label', sortable: true, renderCell: (row) => getStatusChip(row.status, row.adminNotes) },
    { id: 'room.name', label: 'room_name_label', sortable: true, renderCell: (row) => row.room?.name || 'N/A' },
    { id: 'reservedBy', label: 'reserved_by_label', sortable: true },
    { id: 'date', label: 'date_label', sortable: true, renderCell: (row) => format(new Date(row.date), 'dd/MM/yyyy') },
    { id: 'startTime', label: 'time_slot_label', sortable: true, renderCell: (row) => `${row.startTime} - ${row.endTime}` },
    { id: 'purpose', label: 'purpose_label', sortable: true },
    { id: 'actions', label: 'actions_label', align: 'center', renderCell: (row) => (
      row.status === 'pending' && (
        <Stack direction="row" spacing={1} justifyContent="center">
          <IconButton color="success" onClick={() => handleStatusUpdate(row._id, 'approved')}><CheckCircleIcon /></IconButton>
          <IconButton color="error" onClick={() => openRejectModal(row)}><CancelIcon /></IconButton>
        </Stack>
      )
    )}
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('reservations_management_title')}
      </Typography>
      {message.key && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ key: '' })}>{t(message.key)}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button variant="outlined" onClick={() => setShowStats(prev => !prev)}>
          {showStats ? t('hide_reservation_stats') : t('show_reservation_stats')}
        </Button>
      </Box>

      <Box sx={{ mb: 2, maxWidth: '200px' }}>
        <FormControl fullWidth size="small">
          <InputLabel>{t('filter_by_status')}</InputLabel>
          <Select
            value={statusFilter}
            label={t('filter_by_status')}
            onChange={handleFilterChange}
            displayEmpty
          >
            <MenuItem value="all">{t('all_statuses')}</MenuItem>
            <MenuItem value="pending">{t('status_pending')}</MenuItem>
            <MenuItem value="approved">{t('status_approved')}</MenuItem>
            <MenuItem value="rejected">{t('status_rejected')}</MenuItem>
            <MenuItem value="cancelled">{t('status_cancelled')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {showStats && <ReservationStatusChart />}

      <PaginatedTable
        columns={reservationColumns}
        fetchDataFunction={fetchFilteredData}
        refreshKey={refreshKey}
        titleKey="reservations_table_title"
      />
      <Dialog open={rejectModalOpen} onClose={closeRejectModal}>
        <DialogTitle>{t('reject_reservation_title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('rejection_note_label')}
            type="text"
            fullWidth
            variant="standard"
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            helperText={t('rejection_note_helper')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectModal}>{t('cancel_button')}</Button>
          <Button onClick={handleConfirmReject} color="error">{t('confirm_reject_button')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReservationsManagement;