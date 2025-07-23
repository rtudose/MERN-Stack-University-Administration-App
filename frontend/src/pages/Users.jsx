// src/pages/Users.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err); // Log the specific error
      setError(t('fetch_users_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentUserId(null);
    setFormData({ username: '', email: '', password: '', role: 'student' });
  };

  const getTranslatedError = (msg) => {
    if (msg.includes('is shorter than the minimum allowed length')) {
        return t('password_minlength_error');
    }
    if (msg.includes('Please fill a valid email address')) {
        return t('email_invalid_error');
    }
    if (msg.includes('username already exists')) {
        return t('username_exists_error');
    }
    if (msg.includes('email already exists')) {
        return t('user_exists_error');
    }
    
    switch (msg) {
        case 'Cannot remove the last administrator':
            return t('cannot_remove_last_admin');
        case 'You cannot delete your own account':
            return t('cannot_delete_self');
        default:
            return t('generic_error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ text: '', type: '' });

    if (!formData.email || !formData.username || (!isEditing && !formData.password)) {
        setFormMessage({ text: t('form_error_all_fields'), type: 'error' });
        return;
    }

    try {
      if (isEditing) {
        const { username, email, role } = formData;
        await updateUser(currentUserId, { username, email, role });
        setFormMessage({ text: t('user_updated_success'), type: 'success' });
      } else {
        await createUser(formData);
        setFormMessage({ text: t('user_created_success'), type: 'success' });
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      const errorText = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : t('generic_error');
      setFormMessage({ text: errorText, type: 'error' });
    }
  };

  const handleEditClick = (user) => {
    setFormMessage({ text: '', type: '' });
    setIsEditing(true);
    setCurrentUserId(user._id);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
    });
    window.scrollTo(0, 0);
  };

  const handleDeleteClick = async (userId) => {
    if (window.confirm(t('delete_user_confirm'))) {
      try {
        await deleteUser(userId);
        setFormMessage({ text: t('user_deleted_success'), type: 'success' });
        fetchUsers();
      } catch (err) {
        const errorText = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : t('delete_user_error');
        setFormMessage({ text: errorText, type: 'error' });
      }
    }
  };

  if (loading) return <div>{t('loading_users')}</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>{t('users_management_title')}</h2>

      <div style={styles.formContainer}>
        <h3>{isEditing ? t('edit_user_title') : t('add_new_user_title')}</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.formGroup}>
            <label htmlFor="username">{t('username_label')}</label>
            <input type="text" id="username" value={formData.username} onChange={handleInputChange} style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="email">{t('email_label')}</label>
            <input type="email" id="email" value={formData.email} onChange={handleInputChange} style={styles.input} />
          </div>
          {!isEditing && (
            <div style={styles.formGroup}>
              <label htmlFor="password">{t('password_label')}</label>
              <input type="password" id="password" value={formData.password} onChange={handleInputChange} style={styles.input} minLength="6" />
            </div>
          )}
          <div style={styles.formGroup}>
            <label htmlFor="role">{t('role_label')}</label>
            <select id="role" value={formData.role} onChange={handleInputChange} style={styles.input}>
              <option value="student">{t('role_label_student')}</option>
              <option value="admin">{t('role_label_admin')}</option>
              <option value="external_representative">{t('role_label_external_representative')}</option>
            </select>
          </div>
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.button}>
              {isEditing ? t('update_user_button') : t('add_user_button')}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { resetForm(); setFormMessage({ text: '', type: '' }); }} style={styles.cancelButton}>
                {t('cancel_button')}
              </button>
            )}
          </div>
        </form>
        {formMessage.text && <p style={{ color: formMessage.type === 'success' ? 'green' : 'red' }}>{formMessage.text}</p>}
      </div>

      <div style={styles.tableContainer}>
        <h3>{t('existing_users_title')}</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>{t('username_label')}</th>
              <th>{t('email_label')}</th>
              <th>{t('role_label')}</th>
              <th>{t('actions_label')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{t(`role_label_${user.role}`)}</td>
                <td>
                  <button onClick={() => handleEditClick(user)} style={styles.editButton}>{t('edit_button')}</button>
                  <button onClick={() => handleDeleteClick(user._id)} style={styles.deleteButton}>{t('delete_button')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles remain the same
const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: '40px auto', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    header: { textAlign: 'center', color: '#0056b3', marginBottom: '30px' },
    formContainer: { marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' },
    tableContainer: { marginTop: '40px', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' },
    th: { backgroundColor: '#0056b3', color: 'white', padding: '12px 15px' },
    td: { padding: '12px 15px', borderBottom: '1px solid #eee' },
    formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '15px' },
    label: { marginBottom: '5px', fontWeight: 'bold' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    buttonGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
    button: { padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelButton: { padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    editButton: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    deleteButton: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
};

export default Users;