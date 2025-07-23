// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation();
  // Get the role-specific helpers from the context
  const { user, isAuthenticated, loading, isStudent, isExternalRepresentative, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (user && user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        setDashboardLoading(false);
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Placeholder functions for the buttons
  const handleBookRoomClick = () => {
    alert('Room booking page is not yet implemented.');
  };

  const handleViewCoursesClick = () => {
    alert('My Courses page is not yet implemented.');
  };

  // While the component is determining where to redirect, show a loading message
  if (loading || dashboardLoading) {
    return <div style={styles.container}>{t('loading_dashboard')}</div>;
  }

  // This JSX will now only be shown for authenticated, non-admin users
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>{t('user_dashboard_title')}</h2>
      <p style={styles.welcomeText}>{t('welcome_user', { username: user.username })}</p>

      {/* NEW: Conditional logic for buttons based on user role */}
      <div style={styles.actionsContainer}>
        {isStudent && (
          <button style={styles.actionButton} onClick={handleViewCoursesClick}>
            {t('view_my_courses_button')}
          </button>
        )}
        
        {isExternalRepresentative && (
          <button style={styles.actionButton} onClick={handleBookRoomClick}>
            {t('book_a_room_button')}
          </button>
        )}
      </div>

      <button style={styles.logoutButton} onClick={logout}>
        {t('logout_button')}
      </button>
    </div>
  );
}

// Using the more detailed styles from your original file
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
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 8px rgba(40, 167, 69, 0.2)',
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

export default Dashboard;