// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState(''); // Keep state for controlled components
  const [password, setPassword] = useState(''); // Keep state for controlled components
  const [message, setMessage] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- NEW useEffect for redirect ---
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  // --- END NEW useEffect ---

  const getTranslatedErrorMessage = (backendMsg) => {
    switch (backendMsg) {
      case 'Invalid Credentials': // Backend message for incorrect login data
        return t('invalid_credentials_error'); // Use a consistent key for errors
      case 'User not found':
        return t('user_not_found_error'); // Use a consistent key for errors
      case 'Server Error':
        return t('server_error');
      case 'Room with this name already exists':
        return t('room_exists');
      case 'Course not found':
        return t('course_not_found');
      case 'Room not found':
        return t('room_not_found');
      default:
        if (backendMsg.includes("Overlap detected! Room")) {
            return t('overlap_detected_room_booked', {
                roomName: backendMsg.match(/Room (.*?) is already booked/)?.[1] || '',
                courseName: backendMsg.match(/'(.*?)' from/)?.[1] || '',
                startTime: backendMsg.match(/from (.*?) to/)?.[1] || '',
                endTime: backendMsg.match(/to (.*?) on/)?.[1] || '',
                dayOfWeek: backendMsg.match(/on (.*?)\./)?.[1] || ''
            });
        }
        if (backendMsg.includes("Appointment times must be between")) {
            return t('appointment_time_invalid', { start: '09:00', end: '17:00' });
        }
        return backendMsg; // Fallback for any unhandled backend messages
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Access current input values directly from the DOM elements
    const submittedEmail = e.target.elements.email.value.trim();
    const submittedPassword = e.target.elements.password.value.trim();

    // Frontend validation: Check if fields are empty AFTER trimming
    if (!submittedEmail || !submittedPassword) {
      setMessage(t('login_empty_fields_error')); // This error will now correctly trigger
      return; // Stop execution here if fields are empty
    }

    try {
      // Pass the trimmed values to your AuthContext login function
      await login(submittedEmail, submittedPassword);
      setMessage(t('login_success'));
      // The useEffect will handle navigation
    } catch (error) {
      console.error('Eroare Autentificare:', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setMessage(getTranslatedErrorMessage(error.response.data.msg));
      } else {
        setMessage(t('login_failed_generic'));
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>{t('login_header')}</h2>
      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>{t('email_label')}:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>{t('password_label')}:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>{t('login_button')}</button>
      </form>
      {message && <p style={{ ...styles.message, color: message.includes('reușită') || message.includes('success') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

// Basic inline styles for demonstration (you'll use proper CSS later)
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba',
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  message: {
    marginTop: '20px',
    textAlign: 'center',
    color: 'green',
    fontWeight: 'bold',
  },
};

export default Login;