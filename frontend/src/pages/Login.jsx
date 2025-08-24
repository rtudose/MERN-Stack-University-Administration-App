// src/pages/Login.jsx (Corrected with Error Translation)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Container, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ key: '', type: 'info' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const getTranslatedErrorMessage = (backendMsg) => {
    switch (backendMsg) {
      case 'Invalid Credentials':
        return t('invalid_credentials_error');
      case 'User not found':
        return t('user_not_found_error');
      case 'Server Error':
        return t('server_error');
      default:
        return t('login_failed_generic');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ key: '', type: 'info' });
    setIsSubmitting(true);

    if (!email || !password) {
      setMessage({ key: 'login_empty_fields_error', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      const errorMsg = error.response?.data?.msg 
        ? getTranslatedErrorMessage(error.response.data.msg)
        : t('login_failed_generic');
      
      setMessage({ key: errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LockOutlinedIcon sx={{ m: 1, bgcolor: 'secondary.main', p: 1, borderRadius: '50%', color: 'white' }} />
        <Typography component="h1" variant="h5">
          {t('login_header')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('email_label')}
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('password_label')}
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : t('login_button')}
          </Button>
          
          {message.key && (
            <Alert severity={message.type} sx={{ width: '100%' }}>
              {t(message.key)}
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default Login;