import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getToken, saveSession, clearSession } from '../services/auth';
import { fetchProfileAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Verify JWT with backend on initial load/refresh
          const res = await fetchProfileAPI();
          setUser(res.data);
          saveSession(res.data, token);
        } catch (error) {
          console.error('Session validation failed on refresh:', error);
          clearSession();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    saveSession(userData, token);
    setUser(userData);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
