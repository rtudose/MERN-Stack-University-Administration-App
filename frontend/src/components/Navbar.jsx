// src/components/schedule/Navbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useColorMode } from '../context/ThemeContext';
import { Link as RouterLink } from 'react-router-dom';

import {
  AppBar, Toolbar, Typography, Button, IconButton, Box,
  Menu, MenuItem, Avatar, Tooltip, Link, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SchoolIcon from '@mui/icons-material/School';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };
  const handleLanguageChange = () => {
    i18n.changeLanguage(i18n.language === 'ro' ? 'en' : 'ro');
  };

  const userRole = user?.role;
  const homePath = userRole === 'admin' ? '/admin-dashboard' : '/dashboard';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          {user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {(userRole === 'student' || userRole === 'teacher') && (
                <Button component={RouterLink} to="/my-schedule" color="inherit">{t('my_schedule_title')}</Button>
              )}
              {userRole === 'student' && (
                <Button component={RouterLink} to="/my-appointments" color="inherit">{t('my_appointments_title')}</Button>
              )}
              {(userRole === 'external_representative' || userRole === 'teacher') && (
                <Button component={RouterLink} to="/my-reservations" color="inherit">{t('my_reservations_title')}</Button>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Link component={RouterLink} to={user ? homePath : '/'} sx={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon />
            {!isMobile && (
              <Typography variant="h6">
                {t('app_title')}
              </Typography>
            )}
          </Link>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button color="inherit" onClick={handleLanguageChange} sx={{ minWidth: 'auto' }}>
            {i18n.language === 'ro' ? 'EN' : 'RO'}
          </Button>

          <Tooltip title={t('toggle_theme_tooltip')}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {user && (
            <>
              <Tooltip title={t('open_settings_tooltip')}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    {user.email ? user.email[0].toUpperCase() : '?'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem disabled>
                  <Typography textAlign="center" sx={{ fontWeight: 'bold' }}>{user.email}</Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography textAlign="center" variant="caption">{t(`role_label_${user.role}`)}</Typography>
                </MenuItem>
                {user.role === 'student' && user.studentDetails && (
                  <MenuItem disabled>
                    <Typography 
                      textAlign="center" 
                      variant="caption" 
                      sx={{ color: 'text.secondary', width: '100%', borderTop: 1, borderColor: 'divider', pt: 1, mt: 0.5 }}
                    >
                      {t('nav_year')} {user.studentDetails.yearOfStudy} • {user.studentDetails.specialization} • {t('nav_group')} {user.studentDetails.group}
                    </Typography>
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">{t('logout_button')}</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;