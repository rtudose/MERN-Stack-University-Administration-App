// src/pages/AdminDashboard.jsx (Apply this exact code)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function AdminDashboard() {
  const { t } = useTranslation();
  const { user, isAuthenticated, loading, logout } = useAuth(); // Get user object, isAuthenticated, loading from AuthContext
  const navigate = useNavigate();
  const [dashboardLoading, setDashboardLoading] = useState(true); // State to manage content loading specific to this component

  useEffect(() => {
    // Wait until AuthContext has finished its initial loading before checking roles
    if (!loading) {
      if (!isAuthenticated || !user || user.role !== 'admin') {
        // If not authenticated or not an admin, redirect.
        // The ProtectedRoute should handle this, but an explicit check here adds robustness.
        navigate('/dashboard', { replace: true }); // Redirect non-admins or unauthenticated users
      } else {
        setDashboardLoading(false); // Admin user is confirmed, stop dashboard content loading
      }
    }
  }, [isAuthenticated, user, loading, navigate]); // Depend on user, isAuthenticated, and loading from AuthContext

  if (loading || dashboardLoading) {
    return <div style={styles.container}>{t('loading_dashboard')}</div>; // Show loading state
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>{t('admin_dashboard_title')}</h2>
      {/* Access user.role directly from the AuthContext's user object */}
      <p style={styles.welcomeText}>{t('admin_dashboard_welcome', { role: user.role })}</p>

      {/* Admin specific actions/links */}
      <div style={styles.actionsContainer}>
        <button style={styles.actionButton} onClick={() => navigate('/rooms')}>
          {t('manage_rooms_button')}
        </button>
        <button style={styles.actionButton} onClick={() => navigate('/users')}>
          {t('manage_users_button')}
        </button>
        <button style={styles.actionButton} onClick={() => navigate('/courses-management')}>
          {t('manage_courses_button')}
        </button>
        {/* Add more admin specific actions here */}
      </div>

      <button style={styles.logoutButton} onClick={logout}>
        {t('logout_button')}
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '20px',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    fontSize: '2.5em',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: '1.2em',
    color: '#555',
    marginBottom: '40px',
    textAlign: 'center',
  },
  actionsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '40px',
  },
  actionButton: {
    padding: '15px 25px',
    fontSize: '1.1em',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 8px rgba(0, 123, 255, 0.2)',
    minWidth: '200px',
  },
  logoutButton: {
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

export default AdminDashboard;