// src/pages/Rooms.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../services/roomService';

import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BackButton from '../components/BackButton';

function Rooms() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [formData, setFormData] = useState({ name: '', capacity: '', location: '' });

  // NEW: Helper function to translate specific backend errors
  const getTranslatedBackendError = (msg) => {
    switch (msg) {
      case 'Room with this name already exists':
        return t('room_exists_error');
      // Add other room-specific error mappings here in the future
      default:
        return null;
    }
  };

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllRooms();
      setRooms(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError(t('rooms_fetch_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentRoomId(null);
    setFormData({ name: '', capacity: '', location: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');

    const { name, capacity, location } = formData;
    const trimmedName = name.trim();
    const trimmedCapacity = String(capacity).trim();
    const trimmedLocation = location.trim();

    if (!trimmedName || !trimmedLocation || trimmedCapacity === '') {
      setFormMessage(t('add_room_empty_fields_error'));
      setMessageType('error');
      return;
    }
    const parsedCapacity = parseFloat(trimmedCapacity);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0 || !Number.isInteger(parsedCapacity)) {
      setFormMessage(t('capacity_invalid_error'));
      setMessageType('error');
      return;
    }

    const roomPayload = {
      name: trimmedName,
      capacity: parsedCapacity,
      location: trimmedLocation,
    };

    try {
      if (isEditing) {
        await updateRoom(currentRoomId, roomPayload);
        setFormMessage(t('room_updated_success', { roomName: trimmedName }));
      } else {
        await createRoom(roomPayload);
        setFormMessage(t('room_added_success', { roomName: trimmedName }));
      }
      setMessageType('success');
      resetForm();
      fetchRooms();
    } catch (err) {
      // UPDATED: Use the new error mapping function
      let finalErrorMsg;
      if (err.response?.data?.msg) {
        finalErrorMsg = getTranslatedBackendError(err.response.data.msg);
      }
      
      if (!finalErrorMsg) {
        finalErrorMsg = t(isEditing ? 'update_room_generic_error' : 'add_room_generic_error');
      }
      
      setFormMessage(finalErrorMsg);
      setMessageType('error');
    }
  };

  const handleEditClick = (room) => {
    setFormMessage('');
    setIsEditing(true);
    setCurrentRoomId(room._id);
    setFormData({ name: room.name, capacity: room.capacity, location: room.location });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (roomId) => {
    if (window.confirm(t('delete_room_confirm'))) {
      try {
        await deleteRoom(roomId);
        setFormMessage(t('room_deleted_success'));
        setMessageType('success');
        setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
      } catch (err) {
        setFormMessage(t('delete_room_generic_error'));
        setMessageType('error');
      }
    }
  };

  if (loading) return <div>{t('loading_rooms')}</div>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('rooms_management_title')}
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEditing ? t('edit_room_title') : t('add_new_room_title')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth required id="name" label={t('room_name_label')} value={formData.name} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth required id="capacity" label={t('room_capacity_label')} value={formData.capacity} onChange={handleInputChange} type="number" inputProps={{ min: 1, step: 1 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth required id="location" label={t('room_location_label')} value={formData.location} onChange={handleInputChange} />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained">
              {isEditing ? t('update_room_button') : t('add_room_button')}
            </Button>
            {isEditing && (
              <Button variant="outlined" onClick={() => { resetForm(); setFormMessage(''); }}>
                {t('cancel_button')}
              </Button>
            )}
          </Stack>
        </Box>
        {formMessage && <Alert severity={messageType} sx={{ mt: 2 }}>{formMessage}</Alert>}
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('available_rooms')}
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('room_name_label')}</TableCell>
                <TableCell align="right">{t('room_capacity_label')}</TableCell>
                <TableCell>{t('room_location_label')}</TableCell>
                <TableCell align="center">{t('actions_label')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{room.name}</TableCell>
                  <TableCell align="right">{room.capacity}</TableCell>
                  <TableCell>{room.location}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditClick(room)} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteClick(room._id)} color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default Rooms;