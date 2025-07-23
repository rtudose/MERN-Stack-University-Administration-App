// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth(); // Destructure isAdmin
  const navigate = useNavigate();
  const { t } = useTranslation();

  const translatedRole = user ? t(`role_label_${user.role}`) : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <Link to="/dashboard" style={styles.navLink}>
            {t('dashboard_link')}
          </Link>
        </li>
        {/* Only show Rooms link if user is an admin */}
        {isAdmin && ( // Use isAdmin from useAuth
          <li style={styles.navItem}>
            <Link to="/rooms" style={styles.navLink}>
              {t('rooms_link')}
            </Link>
          </li>
        )}
      </ul>
      <div style={styles.userSection}>
        {user && (
          <span style={styles.userInfo}>
            {t('logged_in_as')}: {user.email} ({translatedRole})
            {/*{t('logged_in_as')}: {user.email} ({user.role === 'admin' ? t('role_admin') : t('role_student')})*/}
          </span>
        )}
        <button onClick={handleLogout} style={styles.logoutButton}>
          {t('logout_button')}
        </button>
      </div>
    </nav>
  );
};

// Basic inline styles for the Navbar
const styles = {
  navbar: {
    backgroundColor: '#333',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
  },
  navList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
  },
  navItem: {
    marginRight: '20px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userInfo: {
    marginRight: '20px',
    fontSize: '14px',
  },
  logoutButton: {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Navbar;