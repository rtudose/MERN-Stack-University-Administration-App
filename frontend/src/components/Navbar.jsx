// src/components/Navbar.jsx (Updated with Language Switcher)
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useColorMode } from '../context/ThemeContext';

import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation(); // Get the i18n instance
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  const translatedRole = user ? t(`role_label_${user.role}`) : '';

  const handleLanguageChange = () => {
    const newLang = i18n.language === 'ro' ? 'en' : 'ro';
    i18n.changeLanguage(newLang);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/* Dashboard Link could go here */}
        </Typography>

        {/* Language Switcher Button */}
        <Button color="inherit" onClick={handleLanguageChange} sx={{ mr: 1 }}>
          {i18n.language === 'ro' ? 'EN' : 'RO'}
        </Button>
        
        <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Typography sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {user.email} ({translatedRole})
            </Typography>
            <Button color="inherit" onClick={logout}>
              {t('logout_button')}
            </Button>
          </Box>
        ) : (
          <Button color="inherit" href="/login">
            {t('login_button')}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;