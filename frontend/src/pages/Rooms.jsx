// src/pages/Rooms.jsx (Polished Version)
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createRoom, updateRoom, deleteRoom, getPaginatedRooms } from '../services/roomService';
import PaginatedTable from '../components/common/PaginatedTable';
import RoomStatusChart from '../components/charts/RoomStatusChart';
import BackButton from '../components/BackButton';
import {
  Container, Box, Typography, TextField, Button, Alert, Paper, Grid, Stack, IconButton,
  Select, MenuItem, Checkbox, ListItemText, OutlinedInput, InputLabel, FormControl,
  FormControlLabel, Switch, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const equipmentOptionKeys = [
  'Projector', 'Whiteboard', 'Conference_Phone', 'Video_Conferencing', 'Smartboard'
];

function Rooms() {
  const { t } = useTranslation();
  const [formMessage, setFormMessage] = useState({ key: '', options: {}, type: 'success' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const initialState = {
    name: '', capacity: '', location: '', equipment: [], isAvailableForExternal: false, status: 'available'
  };
  const [formData, setFormData] = useState(initialState);
  const [showStats, setShowStats] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentRoomId(null);
    setFormData(initialState);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: inputValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ key: '', type: 'success' });

    const { name, capacity, location } = formData;
    if (!name.trim() || !String(capacity).trim() || !location.trim()) {
      setFormMessage({key: 'add_room_empty_fields_error', type: 'error'});
      return;
    }
    const parsedCapacity = parseFloat(capacity);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0 || !Number.isInteger(parsedCapacity)) {
      setFormMessage({key: 'capacity_invalid_error', type: 'error'});
      return;
    }

    const payload = { ...formData, capacity: parsedCapacity };

    try {
      if (isEditing) {
        await updateRoom(currentRoomId, payload);
        setFormMessage({ 
          key: 'room_updated_success', 
          options: { roomName: payload.name }, 
          type: 'success' 
        });
      } else {
        await createRoom(payload);
        setFormMessage({
          key: 'room_added_success', 
          options: { roomName: payload.name }, 
          type: 'success' 
        });
      }
      resetForm();
      setRefreshKey(oldKey => oldKey + 1);
    } catch (err) {
      let finalErrorMsgKey = isEditing ? 'update_room_generic_error' : 'add_room_generic_error';
      if (err.response?.data?.msg === 'Room with this name already exists') {
          finalErrorMsgKey = 'room_exists_error';
      }
      setFormMessage({ key: finalErrorMsgKey, type: 'error' });
    }
  };

  const handleEditClick = (room) => {
    setFormMessage({ key: '', type: '' });
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
        setFormMessage({ key: 'room_deleted_success', type: 'success' });
        setRefreshKey(oldKey => oldKey + 1);
      } catch (err) {
        setFormMessage({ key: 'delete_room_generic_error', type: 'error' });
      }
    }
  };

  const roomColumns = [
    { id: 'name', label: 'room_name_label', sortable: true },
    { id: 'status', label: 'status_label', sortable: true, renderCell: (row) => t(`status_${row.status}`) },
    { id: 'isAvailableForExternal', label: 'available_for_external_label', sortable: true, renderCell: (row) => t(row.isAvailableForExternal ? 'boolean_yes' : 'boolean_no')},
    { id: 'capacity', label: 'room_capacity_label', sortable: true, align: 'right' },
    { id: 'equipment', label: 'equipment_label', sortable: false, renderCell: (row) => row.equipment.map(key => t(`equipment_${key}`)).join(', ') },
    {
      id: 'actions',
      label: 'actions_label',
      align: 'center',
      renderCell: (row) => (
        <>
          <IconButton onClick={() => handleEditClick(row)} color="primary"><EditIcon /></IconButton>
          <IconButton onClick={() => handleDeleteClick(row._id)} color="error"><DeleteIcon /></IconButton>
        </>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ pt: 2, pb: 4 }}>
      <BackButton />
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        {t('rooms_management_title')}
      </Typography>

      {formMessage.key && (
        <Alert
          severity={formMessage.type}
          sx={{ mb: 2 }}
          onClose={() => setFormMessage({ key: '', type: 'success' })}
        >
          {t(formMessage.key, formMessage.options)}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
            variant="outlined"
            onClick={() => setShowStats(prev => !prev)}
        >
            {showStats ? t('hide_stats') : t('show_stats')}
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
          {isEditing ? t('edit_room_title') : t('add_new_room_title')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth required name="name" label={t('room_name_label')} value={formData.name} onChange={handleInputChange} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth required name="capacity" label={t('room_capacity_label')} value={formData.capacity} onChange={handleInputChange} type="number" inputProps={{ min: 1, step: 1 }} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth required name="location" label={t('room_location_label')} value={formData.location} onChange={handleInputChange} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>{t('equipment_label')}</InputLabel>
                <Select name="equipment" multiple value={formData.equipment} onChange={handleInputChange} input={<OutlinedInput label={t('equipment_label')} />} renderValue={(selected) => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((value) => <Chip key={value} label={t(`equipment_${value}`)} />)}</Box>)}>
                  {equipmentOptionKeys.map((key) => (<MenuItem key={key} value={key}><Checkbox checked={formData.equipment.indexOf(key) > -1} /><ListItemText primary={t(`equipment_${key}`)} /></MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>{t('status_label')}</InputLabel>
                <Select name="status" value={formData.status} label={t('status_label')} onChange={handleInputChange}>
                  <MenuItem value="available">{t('status_available')}</MenuItem>
                  <MenuItem value="under_maintenance">{t('status_under_maintenance')}</MenuItem>
                  <MenuItem value="unavailable">{t('status_unavailable')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size = {12}><FormControlLabel control={<Switch checked={formData.isAvailableForExternal} onChange={handleInputChange} name="isAvailableForExternal" />} label={t('available_for_external_label')} /></Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained">{isEditing ? t('update_room_button') : t('add_room_button')}</Button>
            {isEditing && (<Button variant="outlined" onClick={resetForm}>{t('cancel_button')}</Button>)}
          </Stack>
        </Box>
      </Paper>

      {showStats && <RoomStatusChart />}

      <PaginatedTable
        columns={roomColumns}
        fetchDataFunction={getPaginatedRooms}
        refreshKey={refreshKey}
        titleKey="available_rooms"
      />
    </Container>
  );
}

export default Rooms;