// src/pages/BookAppointment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvailableSlots, createAppointment } from '../services/appointmentService';
import BackButton from '../components/BackButton';
import {
  Container, Typography, Paper, Grid, Button, Alert,
  TextField, FormControl, InputLabel, Select, MenuItem, Box,
  CircularProgress, Stack
} from '@mui/material';

const appointmentTypes = ['Adeverinte', 'Cereri de bursa', 'Reinmatriculare', 'Alte solicitari'];

const BookAppointment = () => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState(appointmentTypes[0]);
  const [description, setDescription] = useState('');
  
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchSlots = useCallback(async (date) => {
    try {
      setLoadingSlots(true);
      // Don't clear the main success message when fetching new slots
      // setMessage({ text: '', type: '' }); 
      const response = await getAvailableSlots(date);
      setAvailableSlots(response.data);
    } catch (err) {
      setMessage({ text: 'fetch_slots_error', type: 'error' });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null);
  };

  const handleBooking = async () => {
    setMessage({ text: '', type: '' });
    if (!selectedSlot) {
      setMessage({ text: 'select_slot_error', type: 'error' });
      return;
    }

    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const [startHour, startMinute] = selectedSlot.startTime.split(':').map(Number);
    selectedDateTime.setHours(startHour, startMinute, 0, 0);

    if (selectedDateTime < now) {
      setMessage({ text: 'appointment_past_time_error', type: 'error' });
      return;
    }

    try {
      const payload = {
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        typeOfRequest: appointmentType,
        description: description,
      };
      await createAppointment(payload);
      setMessage({ text: 'appointment_success', type: 'success' });
      setSelectedSlot(null);
      fetchSlots(selectedDate);
    } catch (err) {
      const errorKey = err.response?.data?.msg || 'generic_error';
      setMessage({ text: errorKey, type: 'error' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('book_appointment_title')}
      </Typography>
      
      {message.text && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ text: '', type: '' })}>{t(message.text, { fallback: message.text })}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>{t('step_1_title')}</Typography>
            <Stack spacing={2}>
              <TextField
                label={t('date_label')}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
              />
              <FormControl fullWidth>
                <InputLabel>{t('request_type_label')}</InputLabel>
                <Select
                  value={appointmentType}
                  label={t('request_type_label')}
                  onChange={(e) => setAppointmentType(e.target.value)}
                >
                  {appointmentTypes.map(type => (
                    <MenuItem key={type} value={type}>{t(`request_${type.replace(/\s/g, '_')}`)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label={t('description_label')}
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" gutterBottom>{t('step_2_title')}</Typography>
            {loadingSlots ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
              <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                <Grid container spacing={1} sx={{ width: '100%' }}>
                  {availableSlots.length > 0 ? availableSlots.map(slot => (
                    <Grid size={{ xs: 12, sm: 4 }} key={slot.startTime}>
                      <Button
                        fullWidth
                        variant={selectedSlot?.startTime === slot.startTime ? 'contained' : 'outlined'}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.startTime}
                      </Button>
                    </Grid>
                  )) : <Typography sx={{ p: 2 }}>{t('no_slots_available')}</Typography>}
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button variant="contained" size="large" onClick={handleBooking} disabled={!selectedSlot}>
            {t('confirm_appointment_button')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookAppointment;