// src/pages/BookAppointment.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAvailableSlots, createAppointment } from '../services/appointmentService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getDay } from 'date-fns';
import BackButton from '../components/BackButton';
import {
  Container, Typography, Paper, Grid, Button, Alert,
  TextField, FormControl, InputLabel, Select, MenuItem, Box,
  CircularProgress, Stack, Divider, IconButton
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const appointmentTypes = ['Adeverinte', 'Cereri de bursa', 'Reinmatriculare', 'Alte solicitari'];

const BookAppointment = () => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState(appointmentTypes[0]);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState({ key: '', type: '' });
  const scrollableBoxRef = useRef(null);

  const fetchSlots = useCallback(async (date) => {
    try {
      setLoadingSlots(true);
      const response = await getAvailableSlots(date);
      setAvailableSlots(response.data);
    } catch (err) {
      setMessage({ key: 'fetch_slots_error', type: 'error' });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  const isWeekend = (date) => {
    const day = getDay(date);
    return day === 0 || day === 6;
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  const resetForm = () => {
    setSelectedSlot(null);
    setAppointmentType(appointmentTypes[0]);
    setDescription('');
  };

  const handleBooking = async () => {
    setMessage({ key: '', type: '' });
    if (!selectedSlot) {
      setMessage({ key: 'select_slot_error', type: 'error' });
      return;
    }

    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const [startHour, startMinute] = selectedSlot.startTime.split(':').map(Number);
    selectedDateTime.setHours(startHour, startMinute, 0, 0);

    if (selectedDateTime < now) {
      setMessage({ key: 'appointment_past_time_error', type: 'error' });
      return;
    }

    try {
      const payload = {
        date: selectedDate.toISOString().split('T')[0],
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        typeOfRequest: appointmentType,
        description: description,
      };
      const response = await createAppointment(payload);
      const newAppointmentId = response.data.appointment?._id;
      if (newAppointmentId) {
        setMessage({ key: 'appointment_success_redirect', type: 'success' });
        
        setTimeout(() => {
          navigate('/my-appointments', { state: { highlightedId: newAppointmentId } });
        }, 3000);
      } else {
        throw new Error("Failed to get new appointment ID from response.");
      }
    } catch (err) {
      const errorKey = err.response?.data?.msg || 'generic_error';
      setMessage({ key: errorKey, type: 'error' });
    }
  };

  const handleScroll = (direction) => {
    if (scrollableBoxRef.current) {
      const scrollAmount = direction === 'up' ? -75 : 75;
      scrollableBoxRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const hour = parseInt(slot.startTime.split(':')[0], 10);
    const period = hour < 13 ? 'morning' : 'afternoon';
    if (!acc[period]) {
      acc[period] = [];
    }
    acc[period].push(slot);
    return acc;
  }, {});
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('book_appointment_title')}
      </Typography>
      
      {message.key && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ key: '', type: '' })}>{t(message.key, { fallback: message.key })}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={4} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, md: 5.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarTodayIcon color="primary" />
              <Typography variant="h6" gutterBottom>{t('step_1_title')}</Typography>
            </Box>
            <Stack spacing={2}>
              <DatePicker
                label={t('date_label')}
                value={selectedDate}
                onChange={handleDateChange}
                shouldDisableDate={isWeekend}
                minDate={new Date()} 
                disablePast
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
                required={appointmentType === 'Alte solicitari'} 
              />
            </Stack>
          </Grid>
          
          <Grid size={ 0.8 } sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <Divider orientation="vertical" />
          </Grid>

          <Grid size={{ xs: 12, md: 5.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccessTimeIcon color="primary" />
              <Typography variant="h6">{t('step_2_title')}</Typography>
            </Box>
            {loadingSlots ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
              <Box sx={{ position: 'relative', width: '100%' }}>
                <Box ref={scrollableBoxRef} sx={{ maxHeight: 300, overflowY: 'auto', pr: 2 }}>
                  {Object.keys(groupedSlots).length > 0 ? (
                    Object.entries(groupedSlots).map(([period, slots]) => (
                      <Box key={period} mb={2}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                          {t(`time_period_${period}`)}
                        </Typography>
                        <Grid container spacing={1} sx={{ width: '100%' }}>
                          {slots.map(slot => (
                            <Grid size={{ xs: 12, sm: 4 }} key={slot.startTime}>
                              <Button
                                fullWidth
                                variant={selectedSlot?.startTime === slot.startTime ? 'contained' : 'outlined'}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                {slot.startTime}
                              </Button>
                            </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))
                 ) : (
                    <Typography sx={{ p: 2 }}>{t('no_slots_available')}</Typography>
                 )}
                </Box>
                <IconButton
                onClick={() => handleScroll('up')}
                size="small"
                sx={{
                  position: 'absolute',
                  top: '-22px',
                  right: '-12px',
                  zIndex: 1,
                }}
              >
                <KeyboardArrowUpIcon />
              </IconButton>
              <IconButton
                onClick={() => handleScroll('down')}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: '-22px',
                  right: '-12px',
                  zIndex: 1,
                }}
              >
                <KeyboardArrowDownIcon />
              </IconButton>
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