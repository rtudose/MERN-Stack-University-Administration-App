// src/components/Navbar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useColorMode } from '../context/ThemeContext'; // Import our new hook

// Import MUI components and icons
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme(); // Access the current MUI theme
  const { toggleColorMode } = useColorMode(); // Get our toggle function

  const translatedRole = user ? t(`role_label_${user.role}`) : '';

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/* We can put a dashboard link here if needed */}
        </Typography>

        {/* Theme Toggle Button */}
        <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: 2 }}>
              {user.email} ({translatedRole})
            </Typography>
            <Button color="inherit" onClick={logout}>
              {t('logout_button')}
            </Button>
          </Box>
        ) : (
          <Button color="inherit" href="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;