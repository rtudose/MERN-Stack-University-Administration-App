// src/pages/Rooms.jsx (Polished Version)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../services/roomService';
import BackButton from '../components/BackButton';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Select, MenuItem, Checkbox, ListItemText, OutlinedInput, InputLabel, FormControl,
  FormControlLabel, Switch, Chip, TableSortLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const equipmentOptionKeys = [
  'Projector', 'Whiteboard', 'Conference_Phone', 'Video_Conferencing', 'Smartboard'
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) { return -1; }
  if (b[orderBy] > a[orderBy]) { return 1; }
  return 0;
}
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function Rooms() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', capacity: '', location: '', equipment: [], isAvailableForExternal: true, status: 'available'
  });

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  
  const getTranslatedBackendError = (msg) => {
    switch (msg) {
      case 'Room with this name already exists': return t('room_exists_error');
      default: return null;
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

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentRoomId(null);
    setFormMessage('');
    setMessageType('');
    setFormData({ name: '', capacity: '', location: '', equipment: [], isAvailableForExternal: true, status: 'available' });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Use `checked` for Switch, and `value` for all other inputs
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: inputValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');

    const { name, capacity, location } = formData;
    if (!name.trim() || !String(capacity).trim() || !location.trim()) {
      setFormMessage(t('add_room_empty_fields_error')); setMessageType('error'); return;
    }
    const parsedCapacity = parseFloat(capacity);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0 || !Number.isInteger(parsedCapacity)) {
      setFormMessage(t('capacity_invalid_error')); setMessageType('error'); return;
    }

    const payload = { ...formData, capacity: parsedCapacity };

    try {
      if (isEditing) {
        await updateRoom(currentRoomId, payload);
        setFormMessage(t('room_updated_success', { roomName: payload.name }));
      } else {
        await createRoom(payload);
        setFormMessage(t('room_added_success', { roomName: payload.name }));
      }
      setMessageType('success');
      resetForm();
      fetchRooms();
    } catch (err) {
      let finalErrorMsg;
      if (err.response?.data?.msg) { finalErrorMsg = getTranslatedBackendError(err.response.data.msg); }
      if (!finalErrorMsg) { finalErrorMsg = t(isEditing ? 'update_room_generic_error' : 'add_room_generic_error'); }
      setFormMessage(finalErrorMsg);
      setMessageType('error');
    }
  };

  const handleEditClick = (room) => {
    setFormMessage('');
    setIsEditing(true);
    setCurrentRoomId(room._id);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      equipment: room.equipment || [],
      isAvailableForExternal: room.isAvailableForExternal,
      status: room.status
    });
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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRooms = useMemo(() => {
      return rooms.slice().sort(getComparator(order, orderBy));
  }, [rooms, order, orderBy]);

  if (loading) return <div>{t('loading_rooms')}</div>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ pt: 2, pb: 4, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 96px)' }}>
      <Box sx={{ flexShrink: 0 }}>
        <BackButton />
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>{t('rooms_management_title')}</Typography>
        {formMessage.text && <Alert severity={formMessage.type} sx={{ mb: 2 }} onClose={() => setFormMessage({ text: '', type: '' })}>{t(formMessage.text, { roomName: formData.name })}</Alert>}
        
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>{isEditing ? t('edit_room_title') : t('add_new_room_title')}</Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField fullWidth required name="name" label={t('room_name_label')} value={formData.name} onChange={handleInputChange} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth required name="capacity" label={t('room_capacity_label')} value={formData.capacity} onChange={handleInputChange} type="number" inputProps={{ min: 1, step: 1 }} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth required name="location" label={t('room_location_label')} value={formData.location} onChange={handleInputChange} /></Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('equipment_label')}</InputLabel>
                  <Select name="equipment" multiple value={formData.equipment} onChange={handleInputChange} input={<OutlinedInput label={t('equipment_label')} />} renderValue={(selected) => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((value) => <Chip key={value} label={t(`equipment_${value}`)} />)}</Box>)}>
                    {equipmentOptionKeys.map((key) => (<MenuItem key={key} value={key}><Checkbox checked={formData.equipment.indexOf(key) > -1} /><ListItemText primary={t(`equipment_${key}`)} /></MenuItem>))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('status_label')}</InputLabel>
                  <Select name="status" value={formData.status} label={t('status_label')} onChange={handleInputChange}>
                    <MenuItem value="available">{t('status_available')}</MenuItem>
                    <MenuItem value="under_maintenance">{t('status_under_maintenance')}</MenuItem>
                    <MenuItem value="unavailable">{t('status_unavailable')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}><FormControlLabel control={<Switch checked={formData.isAvailableForExternal} onChange={handleInputChange} name="isAvailableForExternal" />} label={t('available_for_external_label')} /></Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}><Button type="submit" variant="contained">{isEditing ? t('update_room_button') : t('add_room_button')}</Button>{isEditing && (<Button variant="outlined" onClick={resetForm}>{t('cancel_button')}</Button>)}</Stack>
          </Box>
        </Paper>
      </Box>
      
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>{t('available_rooms')}</Typography>
        <TableContainer sx={{ flexGrow: 1 }}>
          <Table stickyHeader>
              <TableHead>
                  <TableRow>
                      <TableCell sortDirection={orderBy === 'name' ? order : false}><TableSortLabel active={orderBy === 'name'} direction={order} onClick={() => handleRequestSort('name')}>{t('room_name_label')}</TableSortLabel></TableCell>
                      <TableCell sortDirection={orderBy === 'status' ? order : false}><TableSortLabel active={orderBy === 'status'} direction={order} onClick={() => handleRequestSort('status')}>{t('status_label')}</TableSortLabel></TableCell>
                      <TableCell sortDirection={orderBy === 'isAvailableForExternal' ? order : false}><TableSortLabel active={orderBy === 'isAvailableForExternal'} direction={order} onClick={() => handleRequestSort('isAvailableForExternal')}>{t('available_for_external_label')}</TableSortLabel></TableCell>
                      <TableCell align="right" sortDirection={orderBy === 'capacity' ? order : false}><TableSortLabel active={orderBy === 'capacity'} direction={order} onClick={() => handleRequestSort('capacity')}>{t('room_capacity_label')}</TableSortLabel></TableCell>
                      <TableCell>{t('equipment_label')}</TableCell>
                      <TableCell align="center">{t('actions_label')}</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                  {sortedRooms.map((room) => (
                      <TableRow hover key={room._id}>
                          <TableCell>{room.name}</TableCell>
                          <TableCell>{t(`status_${room.status}`)}</TableCell>
                          <TableCell>{t(room.isAvailableForExternal ? 'boolean_yes' : 'boolean_no')}</TableCell>
                          <TableCell align="right">{room.capacity}</TableCell>
                          <TableCell>{room.equipment.map(key => t(`equipment_${key}`)).join(', ')}</TableCell>
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