// src/pages/BookRoom.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getPublicRooms } from '../services/roomService';
import { createRoomReservation } from '../services/roomReservationService';
import BackButton from '../components/BackButton';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

import {
  Container, Typography, Grid, Card, CardContent, CardActions, Button,
  Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Alert, Select, MenuItem, Checkbox, ListItemText, OutlinedInput,
  InputLabel, FormControl, Chip, Box
} from '@mui/material';

const equipmentOptionKeys = [
  'Projector', 'Whiteboard', 'Conference_Phone', 'Video_Conferencing', 'Smartboard'
];

const setTime = (date, hours, minutes) => {
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

const BookRoom = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [capacityFilter, setCapacityFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [reservationData, setReservationData] = useState({
    date: new Date(),
    startTime: setTime(new Date(), 9, 0),
    endTime: setTime(new Date(), 10, 0),
    purpose: '',
    attendees: 1
  });
  
  const [pageMessage, setPageMessage] = useState({ key: '', type: '' });
  const [modalError, setModalError] = useState({ key: '', type: 'error' });

  const getTranslatedError = (msg) => {
    if (msg.includes('Cast to Number failed')) return 'attendees_integer_error';
    if (msg.includes('is required')) return 'reservation_error_required';
    if (msg.includes('HH:MM format')) return 'reservation_error_time_format';
    if (msg.includes('End time must be after start time')) return 'reservation_error_endtime';
    if (msg.includes('exceeds room capacity')) return 'reservation_error_capacity';
    return 'generic_error';
  };

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPublicRooms();
      setRooms(response.data);
    } catch (err) {
      setError('fetch_rooms_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const capacityMatch = capacityFilter ? room.capacity >= parseInt(capacityFilter, 10) : true;
      const equipmentMatch = equipmentFilter.length > 0 ? equipmentFilter.every(itemKey => room.equipment.includes(itemKey)) : true;
      return capacityMatch && equipmentMatch;
    });
  }, [rooms, capacityFilter, equipmentFilter]);

  const handleOpenModal = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
    setModalError('');
    setReservationData({
      date: new Date(),
      startTime: setTime(new Date(), 9, 0),
      endTime: setTime(new Date(), 10, 0),
      purpose: '',
      attendees: 1
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setReservationData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateDataChange = (newDate) => {
    setReservationData(prev => ({ ...prev, date: newDate }));
  };

  const handleStartTimeChange = (newTime) => {
    setReservationData(prev => ({ ...prev, startTime: newTime }));
  };
  const handleEndTimeChange = (newTime) => {
    setReservationData(prev => ({ ...prev, endTime: newTime }));
  };

  const handleReservationSubmit = async () => {
    setModalError('');

    const now = new Date();
    const combinedDateTime = new Date(reservationData.date);
    combinedDateTime.setHours(
        reservationData.startTime.getHours(),
        reservationData.startTime.getMinutes(),
        0, 0
    );

    if (combinedDateTime < now) {
      setModalError({key: 'reservation_error_past_time', type: 'error'});
      return;
    }

    const purpose = String(reservationData.purpose);
    if (!purpose) {
      setModalError({key: 'reservation_error_empty_purpose', type: 'error'});
      return;
    }

    const attendeesNumber = Number(reservationData.attendees);
    if (!Number.isInteger(attendeesNumber) || attendeesNumber < 1) {
      setModalError({key: 'attendees_integer_error', type: 'error'});
      return;
    }

    try {
      const payload = { 
        ...reservationData, 
        room: selectedRoom._id,
        date: format(reservationData.date, 'yyyy-MM-dd'),
        startTime: format(reservationData.startTime, 'HH:mm'),
        endTime: format(reservationData.endTime, 'HH:mm')
      };
      const response = await createRoomReservation(payload);
      const newReservationId = response.data._id;
      setPageMessage({ key: 'reservation_success_redirect', type: 'success' });
      handleCloseModal();
      setTimeout(() => {
        navigate('/my-reservations', { state: { highlightedId: newReservationId } });
      }, 3000);
    } catch (err) {
      const errorData = err.response?.data;
      
      if (['RESERVATION_ROOM_RESERVED', 'RESERVATION_BLOCKED_BY'].includes(errorData?.msg)) {
        const errorKey = errorData.msg.toLowerCase(); 
        setModalError({ key: errorKey, type: 'error', details: errorData.details });
      } else {
        const errorText = errorData?.msg ? getTranslatedError(errorData.msg) : 'generic_error';
        setModalError({ key: errorText, type: 'error', details: null });
      }
    }
  };

  if (loading) return <div>{t('loading_rooms')}</div>;
  if (error) return <Alert severity="error">{t(error)}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('book_a_room_title')}
      </Typography>
      
      {pageMessage.key && <Alert severity={pageMessage.type} sx={{ mb: 2 }} onClose={() => setPageMessage({ key: '', type: '' })}>{t(pageMessage.key)}</Alert>}

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" gutterBottom>{t('filter_rooms_title')}</Typography>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('filter_by_capacity_label')}
              type="number"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="equipment-filter-label">{t('filter_by_equipment_label')}</InputLabel>
              <Select
                labelId="equipment-filter-label"
                multiple
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                input={<OutlinedInput label={t('filter_by_equipment_label')} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((key) => <Chip key={key} label={t(`equipment_${key}`)} />)}
                  </Box>
                )}
              >
                {equipmentOptionKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    <Checkbox checked={equipmentFilter.indexOf(key) > -1} />
                    <ListItemText primary={t(`equipment_${key}`)} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3} sx={{ width: '100%' }}>
        {filteredRooms.map((room) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">{room.name}</Typography>
                <Typography><strong>{t('room_location_label')}:</strong> {room.location}</Typography>
                <Typography><strong>{t('room_capacity_label')}:</strong> {room.capacity}</Typography>
                {room.equipment.length > 0 && (
                  <Typography><strong>{t('equipment_label')}:</strong> {room.equipment.map(key => t(`equipment_${key}`)).join(', ')}</Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained" onClick={() => handleOpenModal(room)}>
                  {t('book_now_button')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>{t('book_room_for_title')} {selectedRoom?.name}</DialogTitle>
        <DialogContent>
          {modalError && modalError.key && (
            <Alert severity={modalError.type || "error"} sx={{ mb: 2 }}>
                {t(modalError.key, { 
                  ...modalError.details,
                  dayOfWeek: modalError.details?.dayOfWeek ? t(`day_${modalError.details.dayOfWeek}`) : ''
                })}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DatePicker
              label={t('date_label')}
              value={reservationData.date}
              onChange={handleDateDataChange}
              minDate={new Date()}
              disablePast
            />
            <TimePicker
                label={t('start_time_label')}
                value={reservationData.startTime}
                onChange={handleStartTimeChange}
                ampm={false}
            />
            <TimePicker
                label={t('end_time_label')}
                value={reservationData.endTime}
                onChange={handleEndTimeChange}
                ampm={false}
            />
            <TextField name="purpose" label={t('purpose_label')} value={reservationData.purpose} onChange={handleReservationChange} required fullWidth/>
            <TextField name="attendees" label={t('attendees_label')} type="number" value={reservationData.attendees} onChange={handleReservationChange} inputProps={{ min: 1, step: 1 }} required fullWidth/>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('cancel_button')}</Button>
          <Button onClick={handleReservationSubmit} variant="contained">{t('submit_booking_button')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookRoom;