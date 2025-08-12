// src/pages/Rooms.jsx (Polished Version)
import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
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
import { useTheme, lighten } from '@mui/material/styles';
import { useExternalScrollbarSync } from '../theme';

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
  const { t, i18n } = useTranslation();
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
  
  // Track vertical overflow and provide proxy sync using shared hook
  const roomsScrollRef = useRef(null);
  const {
    nativeRef: hookSetRoomsScrollNode,
    proxyRef: hookSetRoomsProxyNode,
    hasOverflow: roomsHasVOverflow,
    ghostHeight: roomsProxyGhostHeight,
    effectiveScrollbarWidth: roomsScrollbarEffective,
    forceAlign,
  } = useExternalScrollbarSync({ deps: [rooms.length, order, orderBy, i18n.language] });
  const setRoomsScrollNode = useCallback((node) => { roomsScrollRef.current = node; hookSetRoomsScrollNode(node); }, [hookSetRoomsScrollNode]);
  const setRoomsProxyNode = useCallback((node) => { hookSetRoomsProxyNode(node); }, [hookSetRoomsProxyNode]);
  const SCROLLBAR_EXTRA = 4;
  const OUTER_GAP = 6;
  const proxyWidth = roomsScrollbarEffective + SCROLLBAR_EXTRA;
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const thumbColor = primary;
  const thumbHover = lighten(primary, 0.1);
  const thumbActive = lighten(primary, 0.2);
  const trackColor = theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.35)' : 'transparent';
  const DEBUG_SCROLL_ROOMS = false; // enable for diagnostics

  // After data mutations/sort/language changes, force-align once
  useEffect(() => { forceAlign(); }, [forceAlign, rooms.length, order, orderBy, i18n.language]);

  // (measurement handled by the reusable hook)

  // Overflow tracking is handled by useExternalScrollbarSync

  // Overflow re-evaluation is handled by useExternalScrollbarSync (deps already include data, sort, language)
  
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

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const mainEl = document.querySelector('main');
    const prevMainOverflow = mainEl ? mainEl.style.overflow : undefined;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (mainEl) mainEl.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (mainEl && typeof prevMainOverflow !== 'undefined') mainEl.style.overflow = prevMainOverflow;
    };
  }, []);

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
    <Container maxWidth="lg" sx={{ pt: 2, pb: 4, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)', overflow: 'visible', minHeight: 0 }}>
      
      <Box sx={{ flexShrink: 0 }}>
        <BackButton />
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>{t('rooms_management_title')}</Typography>
        {formMessage && (
          <Alert
            severity={messageType}
            sx={{ mb: 2 }}
            onClose={() => {
              setFormMessage('');
              setMessageType('');
            }}
          >
            {formMessage}
          </Alert>
        )}
        
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
      
      <Paper sx={{ flexGrow: roomsHasVOverflow ? 1 : 0, display: 'flex', flexDirection: 'column', overflow: 'visible', p: 2, minHeight: 0, backgroundColor: 'transparent' }}>
        <Typography variant="h5" component="h2" gutterBottom>{t('available_rooms')}</Typography>
        <Box sx={{ flex: roomsHasVOverflow ? '1 1 0' : '0 0 auto', position: 'relative', pr: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            flex: roomsHasVOverflow ? '1 1 0' : '0 0 auto',
            position: 'relative',
            overflow: 'visible',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100%',
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: '26px',
            backgroundColor: 'background.paper',
          }}>
            <TableContainer
              key={`rooms-scroll-${i18n.language}`}
              ref={setRoomsScrollNode}
              sx={{
                flex: roomsHasVOverflow ? '1 1 0%' : '0 1 auto',
                minHeight: 0,
                height: roomsHasVOverflow ? '100%' : 'auto',
                maxHeight: roomsHasVOverflow ? '100%' : 'none',
                display: 'block',
                position: 'relative',
                overflowY: 'auto',
                overflowX: 'hidden',
                width: '100%',
                // Hide native scrollbar; external proxy will be rendered outside the frame
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': { width: 0, height: 0 },
                boxSizing: 'content-box',
                pl: 0,
                backgroundColor: 'transparent',
                border: 'none'
              }}
            >
              <Table stickyHeader sx={{ backgroundColor: 'transparent', width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}>
                <TableHead sx={{
                  '& th, & th.MuiTableCell-head': {
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    backgroundColor: 'background.paper',
                    backgroundClip: 'padding-box'
                  },
                  '& th:first-of-type': { borderTopLeftRadius: '26px' },
                  '& th:last-of-type': { borderTopRightRadius: '26px' }
                }}>
                    <TableRow>
                      <TableCell sortDirection={orderBy === 'name' ? order : false}>
                        <TableSortLabel active={orderBy === 'name'} direction={order} onClick={() => handleRequestSort('name')}>
                          {t('room_name_label')}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={orderBy === 'status' ? order : false}>
                        <TableSortLabel active={orderBy === 'status'} direction={order} onClick={() => handleRequestSort('status')}>
                          {t('status_label')}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={orderBy === 'isAvailableForExternal' ? order : false}>
                        <TableSortLabel active={orderBy === 'isAvailableForExternal'} direction={order} onClick={() => handleRequestSort('isAvailableForExternal')}>
                          {t('available_for_external_label')}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right" sortDirection={orderBy === 'capacity' ? order : false}>
                        <TableSortLabel active={orderBy === 'capacity'} direction={order} onClick={() => handleRequestSort('capacity')}>
                          {t('room_capacity_label')}
                        </TableSortLabel>
                      </TableCell>
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
            {/* Proxy scrollbar fully outside the frame, synced with the real scroller */}
            {roomsHasVOverflow && (
              <Box
                key={`rooms-proxy-${i18n.language}`}
                ref={setRoomsProxyNode}
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: `calc(-${proxyWidth}px - ${OUTER_GAP}px)`,
                  width: `${proxyWidth}px`,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  backgroundColor: 'transparent',
                  zIndex: 2,
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${thumbColor} ${trackColor}`,
                  '&::-webkit-scrollbar': { width: `${proxyWidth}px` },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: thumbColor,
                    borderRadius: '8px',
                    border: '2px solid transparent',
                    backgroundClip: 'padding-box',
                    minHeight: '32px'
                  },
                  '&::-webkit-scrollbar-track': { backgroundColor: trackColor },
                  '&:hover::-webkit-scrollbar-thumb': { backgroundColor: thumbHover },
                  '&:active::-webkit-scrollbar-thumb': { backgroundColor: thumbActive },
                  pointerEvents: 'auto',
                  willChange: 'scroll-position'
                }}
              >
                {/* ghost div to create the appropriate scroll range */}
                <Box sx={{ width: 1, height: `${roomsProxyGhostHeight}px` }} />
              </Box>
            )}
            {DEBUG_SCROLL_ROOMS && (
              <Box sx={{ position: 'absolute', bottom: 8, right: 8, p: 1, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 12, zIndex: 3 }}>
                <div>hasOverflow: {String(roomsHasVOverflow)}</div>
                <div>effectiveScrollbarWidth: {String(roomsScrollbarEffective)}</div>
                <div>ghostHeight: {roomsProxyGhostHeight}</div>
                <div>proxy right: {roomsHasVOverflow ? `calc(-${proxyWidth}px - ${OUTER_GAP}px)` : 'n/a'}</div>
                <div>proxy width: {roomsHasVOverflow ? `${proxyWidth}px` : 'n/a'}</div>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Rooms;