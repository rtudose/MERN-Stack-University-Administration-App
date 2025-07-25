// src/pages/Login.jsx (Refactored with MUI)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Import MUI components
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role after successful login
      if (user?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsSubmitting(true);

    if (!email || !password) {
      setMessage(t('login_empty_fields_error'));
      setIsError(true);
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email, password);
      // The useEffect will handle successful navigation
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'login_failed_generic';
      // We don't have a dedicated translation mapper here yet, so we'll just display the key for now.
      // This can be improved by adding back the getTranslatedErrorMessage function.
      setMessage(t(errorMsg, { fallback: errorMsg }));
      setIsError(true);
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
          
          {message && (
            <Alert severity={isError ? 'error' : 'success'} sx={{ width: '100%' }}>
              {message}
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default Login;