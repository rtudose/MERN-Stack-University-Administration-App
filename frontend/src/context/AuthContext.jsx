// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const username = localStorage.getItem('username');
    const studentData = localStorage.getItem('studentDetails');
    const studentDetails = studentData ? JSON.parse(studentData) : null;

    if (token && userRole && username && userEmail) {
      axios.defaults.headers.common['x-auth-token'] = token;
      setUser({ token, role: userRole, email: userEmail, username: username, studentDetails });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, role, username, email: userEmail, studentDetails } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('username', username);

      if (studentDetails) {
        localStorage.setItem('studentDetails', JSON.stringify(studentDetails));
      }

      axios.defaults.headers.common['x-auth-token'] = token;
      setUser({ token, role, username, email: userEmail, studentDetails });

      return { success: true };
    } catch (error) {
      console.error('Login Error:', error.response ? error.response.data : error.message);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    localStorage.removeItem('studentDetails');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  const authContextValue = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user && user.role === 'admin',
    isStudent: user && user.role === 'student',
    isExternalRepresentative: user && user.role === 'external_representative',
    isTeacher: user && user.role === 'teacher',
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};