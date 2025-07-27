// src/pages/BookRoom.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getPublicRooms } from '../services/roomService';
import { createReservation } from '../services/reservationService';
import BackButton from '../components/BackButton';

import {
  Container, Typography, Grid, Card, CardContent, CardActions, Button,
  Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Alert, Select, MenuItem, Checkbox, ListItemText, OutlinedInput,
  InputLabel, FormControl, Chip, Box
} from '@mui/material';

const equipmentOptionKeys = [
  'Projector', 'Whiteboard', 'Conference_Phone', 'Video_Conferencing', 'Smartboard'
];

const BookRoom = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [capacityFilter, setCapacityFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [reservationData, setReservationData] = useState({
    date: today, startTime: '09:00', endTime: '10:00', purpose: '', attendees: 1
  });
  
  const [pageMessage, setPageMessage] = useState({ text: '', type: '' });
  const [modalError, setModalError] = useState('');

  const getTranslatedError = (msg) => {
    if (msg.includes('Cast to Number failed')) return t('attendees_integer_error');
    if (msg.includes('is required')) return t('reservation_error_required');
    if (msg.includes('HH:MM format')) return t('reservation_error_time_format');
    if (msg.includes('End time must be after start time')) return t('reservation_error_endtime');
    if (msg.includes('exceeds room capacity')) return t('reservation_error_capacity');
    return t('generic_error');
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
        date: today, startTime: '09:00', endTime: '10:00', purpose: '', attendees: 1
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

  const handleReservationSubmit = async () => {
    setModalError('');

    const now = new Date();
    const selectedDate = new Date(reservationData.date);
    const [startHour, startMinute] = reservationData.startTime.split(':').map(Number);
    selectedDate.setHours(startHour, startMinute, 0, 0);

    if (selectedDate < now) {
      setModalError(t('reservation_error_past_time'));
      return;
    }

    const attendeesNumber = Number(reservationData.attendees);
    if (!Number.isInteger(attendeesNumber) || attendeesNumber < 1) {
      setModalError(t('attendees_integer_error'));
      return;
    }

    try {
      const payload = { ...reservationData, room: selectedRoom._id, attendees: attendeesNumber };
      await createReservation(payload);
      setPageMessage({ text: 'reservation_success', type: 'success' });
      handleCloseModal();
    } catch (err) {
      const errorText = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : t('generic_error');
      setModalError(errorText);
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
      
      {pageMessage.text && <Alert severity={pageMessage.type} sx={{ mb: 2 }} onClose={() => setPageMessage({ text: '', type: '' })}>{t(pageMessage.text)}</Alert>}

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" gutterBottom>{t('filter_rooms_title')}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('filter_by_capacity_label')}
              type="number"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
      
      {/* THE FIX: The content inside the .map() is now correctly included */}
      <Grid container spacing={3}>
        {filteredRooms.map((room) => (
          <Grid item key={room._id} xs={12} sm={6} md={4}>
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
          {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField name="date" label={t('date_label')} type="date" value={reservationData.date} onChange={handleReservationChange} InputLabelProps={{ shrink: true }} inputProps={{ min: today }} required fullWidth/>
            <TextField name="startTime" label={t('start_time_label')} type="time" value={reservationData.startTime} onChange={handleReservationChange} InputLabelProps={{ shrink: true }} required fullWidth/>
            <TextField name="endTime" label={t('end_time_label')} type="time" value={reservationData.endTime} onChange={handleReservationChange} InputLabelProps={{ shrink: true }} required fullWidth/>
            <TextField name="purpose" label={t('purpose_label')} value={reservationData.purpose} onChange={handleReservationChange} required fullWidth/>
            <TextField name="attendees" label={t('attendees_label')} type="number" value={reservationData.attendees} onChange={handleReservationChange} inputProps={{ min: 1, step: 1 }} fullWidth/>
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