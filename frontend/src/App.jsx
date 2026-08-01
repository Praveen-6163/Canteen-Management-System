import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider, useAuth } from './context/AuthContext';
import Loader from './components/Loader';

// Layout & Pages
import Layout from './components/Layout';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import TokenList from './pages/TokenList';
import UsersList from './pages/UsersList';
import NotFound from './pages/NotFound';

// Admin Private Route Guard
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader message="Verifying permissions..." />;
  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

export default function App() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('cms_theme_mode') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('cms_theme_mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Modern UI theme with Material Design principles
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976D2', // Deep professional Blue
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#fff',
          },
          secondary: {
            main: '#43A047', // Professional Green
            light: '#66bb6a',
            dark: '#2e7d32',
          },
          warning: {
            main: '#FF9800', // Warning Orange accent
          },
          background: {
            default: mode === 'light' ? '#F5F7FA' : '#121212',
            paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 600 },
          subtitle1: { fontWeight: 500 },
          body1: { fontSize: '0.925rem' },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              {/* Initial Screen Check */}
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/login" element={<Login />} />

              {/* Layout Wrappers with persistent side/bottom navigation */}
              <Route path="/" element={<Layout mode={mode} toggleTheme={toggleTheme} />}>
                <Route index element={<Dashboard />} />
                <Route path="tokens" element={<TokenList />} />
                <Route path="profile" element={<Profile />} />
                
                {/* Admin Protected routes */}
                <Route
                  path="users"
                  element={
                    <AdminRoute>
                      <UsersList />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* Redirects */}
              <Route path="/index.html" element={<Navigate to="/splash" replace />} />
              <Route path="*" element={<Navigate to="/splash" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
