// src/pages/Rooms.jsx (Corrected for backend error translation)
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../services/roomService';

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
    name: '',
    capacity: '',
    location: '',
  });

  // NEW: Function to map backend errors to translation keys
  const getTranslatedBackendError = (backendMsg) => {
    switch (backendMsg) {
      case 'Room with this name already exists':
        return t('room_exists_error');
      // You can add more specific error mappings here in the future
      default:
        return null; // Return null if no specific mapping is found
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
      let response;
      if (isEditing) {
        response = await updateRoom(currentRoomId, roomPayload);
        setFormMessage(t('room_updated_success', { roomName: response.data.name }));
        setMessageType('success');
      } else {
        response = await createRoom(roomPayload);
        setFormMessage(t('room_added_success', { roomName: response.data.name }));
        setMessageType('success');
      }
      resetForm();
      fetchRooms();
    } catch (err) {
      console.error("Error submitting form:", err);
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
    setFormData({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
    });
    window.scrollTo(0, 0);
  };

  const handleDeleteClick = async (roomId) => {
    if (window.confirm(t('delete_room_confirm'))) {
      try {
        await deleteRoom(roomId);
        setFormMessage(t('room_deleted_success'));
        setMessageType('success');
        setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
      } catch (err) {
        console.error("Error deleting room:", err);
        setFormMessage(t('delete_room_generic_error'));
        setMessageType('error');
      }
    }
  };

  if (loading) return <div style={styles.container}>{t('loading_rooms')}</div>;
  if (error) return <div style={{ ...styles.container, color: 'red' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>{t('rooms_management_title')}</h2>

      <div style={styles.formContainer}>
        <h3 style={styles.subHeader}>
          {isEditing ? t('edit_room_title') : t('add_new_room_title')}
        </h3>
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>{t('room_name_label')}:</label>
            <input type="text" id="name" value={formData.name} onChange={handleInputChange} style={styles.input} required />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="capacity" style={styles.label}>{t('room_capacity_label')}:</label>
            <input type="number" id="capacity" value={formData.capacity} onChange={handleInputChange} style={styles.input} min="1" step="1" required />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="location" style={styles.label}>{t('room_location_label')}:</label>
            <input type="text" id="location" value={formData.location} onChange={handleInputChange} style={styles.input} required />
          </div>
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.button}>
              {isEditing ? t('update_room_button') : t('add_room_button')}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { resetForm(); setFormMessage(''); }} style={styles.cancelButton}>
                {t('cancel_button')}
              </button>
            )}
          </div>
        </form>
        {formMessage && <p style={{...styles.message, color: messageType === 'success' ? 'green' : 'red' }}>{formMessage}</p>}
      </div>

      <div style={styles.tableContainer}>
        <h3 style={styles.subHeader}>{t('available_rooms')}</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t('room_name')}</th>
              <th style={styles.th}>{t('room_capacity')}</th>
              <th style={styles.th}>{t('room_location')}</th>
              <th style={styles.th}>{t('actions_label')}</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id}>
                <td style={styles.td}>{room.name}</td>
                <td style={styles.td}>{room.capacity}</td>
                <td style={styles.td}>{room.location}</td>
                <td style={styles.td}>
                  <button onClick={() => handleEditClick(room)} style={styles.editButton}>{t('edit_button')}</button>
                  <button onClick={() => handleDeleteClick(room._id)} style={styles.deleteButton}>{t('delete_button')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '40px auto', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  header: { textAlign: 'center', color: '#0056b3', marginBottom: '30px' },
  subHeader: { color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' },
  tableContainer: { marginTop: '40px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
  th: { backgroundColor: '#0056b3', color: 'white', padding: '12px 15px', textAlign: 'left' },
  td: { padding: '12px 15px', borderBottom: '1px solid #eee', textAlign: 'left' },
  formContainer: { marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '5px', fontWeight: 'bold', color: '#555' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' },
  button: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', flex: 1 },
  message: { marginTop: '15px', padding: '10px', borderRadius: '4px', textAlign: 'center' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  editButton: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
  deleteButton: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
  cancelButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', flex: 1 },
};

export default Rooms;