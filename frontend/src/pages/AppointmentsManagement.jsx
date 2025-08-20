// src/pages/AppointmentsManagement.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPaginatedAppointments, updateAppointmentStatus } from '../services/appointmentService';
import BackButton from '../components/BackButton';
import { format } from 'date-fns';
import {
  Container, Typography, IconButton, Chip, Stack, Alert,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button,
  Tooltip, Box
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PaginatedTable from '../components/common/PaginatedTable';

const AppointmentsManagement = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState({ key: '', type: 'success' });
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  const handleStatusUpdate = async (id, status, notes = '') => {
    try {
      await updateAppointmentStatus(id, { status, secretariatNotes: notes });
      setMessage({ key: 'appointment_status_updated', type: 'success' });
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setMessage({ key: 'generic_error', type: 'error' });
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

  const getStatusChip = (status, notes) => {
    const color = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'primary',
      cancelled: 'default',
    }[status];

    if (status === 'cancelled' && notes) {
      return (
        <Tooltip title={notes} arrow>
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

  const appointmentColumns = [
    { id: 'status', label: 'status_label', sortable: true, renderCell: (row) => getStatusChip(row.status, row.secretariatNotes) },
    { id: 'student.username', label: 'student_label', sortable: true, renderCell: (row) => row.student?.username || 'N/A' },
    { id: 'date', label: 'date_label', sortable: true, renderCell: (row) => format(new Date(row.date), 'dd/MM/yyyy') },
    { id: 'startTime', label: 'time_slot_label', sortable: true, renderCell: (row) => `${row.startTime} - ${row.endTime}` },
    { id: 'typeOfRequest', label: 'request_type_label', sortable: true, renderCell: (row) => t(`request_${row.typeOfRequest.replace(/\s/g, '_')}`) },
    { id: 'description', label: 'purpose_of_appointment_label', sortable: false, renderCell: (row) => row.description || 'N/A' },
    { id: 'actions', label: 'actions_label', align: 'center', renderCell: (row) => (
      <>
        {row.status === 'pending' && (
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton title={t('confirm_button')} color="success" onClick={() => handleStatusUpdate(row._id, 'confirmed')}><CheckCircleIcon /></IconButton>
            <IconButton title={t('cancel_button')} color="error" onClick={() => handleOpenRejectionModal(row)}><CancelIcon /></IconButton>
          </Stack>
        )}
        {row.status === 'confirmed' && (
          <Button variant="outlined" size="small" startIcon={<DoneAllIcon />} onClick={() => handleStatusUpdate(row._id, 'completed')}>
            {t('mark_completed_button')}
          </Button>
        )}
      </>
    )}
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('appointments_management_title')}
      </Typography>
      {message.key && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ key: '', type: '' })}>{t(message.key)}</Alert>}

      <PaginatedTable
        columns={appointmentColumns}
        fetchDataFunction={getPaginatedAppointments}
        refreshKey={refreshKey}
        titleKey="appointments_table_title"
      />

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