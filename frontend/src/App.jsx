import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography } from '@mui/material';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, GuestRoute, AdminGuestRoute } from './components/RouteGuards';

// Layout & Pages
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboardOverview from './pages/AdminDashboardOverview';
import Profile from './pages/Profile';
import TokenList from './pages/TokenList';
import UsersList from './pages/UsersList';
import NotFound from './pages/NotFound';

// Premium Visual Placeholder Views for Admin Options
const AdminPlaceholderView = ({ title, icon, description }) => (
  <Box
    sx={{
      p: 6,
      bgcolor: '#27293d',
      borderRadius: '24px',
      color: '#fff',
      textAlign: 'center',
      maxWidth: 600,
      mx: 'auto',
      mt: 6,
      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    }}
  >
    <Typography variant="h1" sx={{ mb: 2, fontSize: '4.5rem' }}>{icon}</Typography>
    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#e0e0e0' }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
      {description}
    </Typography>
  </Box>
);

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

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Splash screen check */}
            <Route path="/splash" element={<SplashScreen />} />

            {/* User Guest Routes */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <Signup />
                </GuestRoute>
              }
            />

            {/* Admin Guest Routes */}
            <Route
              path="/admin"
              element={
                <AdminGuestRoute>
                  <AdminLogin />
                </AdminGuestRoute>
              }
            />

            {/* Admin Protected layout/routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminLayout mode={mode} toggleTheme={toggleTheme} />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboardOverview />} />
              <Route
                path="food"
                element={
                  <AdminPlaceholderView
                    title="Food Management"
                    icon="🍎"
                    description="Configure, update, and manage the general catalog of food products and stock thresholds available in the canteen."
                  />
                }
              />
              <Route
                path="menu"
                element={
                  <AdminPlaceholderView
                    title="Menu Management"
                    icon="📋"
                    description="Establish and publish daily, weekly, or seasonal meal menus and set ordering price points for customers."
                  />
                }
              />
              <Route
                path="coupons"
                element={
                  <AdminPlaceholderView
                    title="Coupons & Offers"
                    icon="🏷️"
                    description="Deploy discount codes, special customer loyalty rewards, and promotional canteen coupon events."
                  />
                }
              />
              <Route
                path="analytics"
                element={
                  <AdminPlaceholderView
                    title="Deep Analytics"
                    icon="📈"
                    description="Access advanced data summaries, print order history reports, and review canteen efficiency KPIs."
                  />
                }
              />
              <Route
                path="settings"
                element={
                  <AdminPlaceholderView
                    title="System Settings"
                    icon="⚙️"
                    description="Modify system parameters, set working hours, customize currency, and configure SMTP mail settings."
                  />
                }
              />
            </Route>

            {/* User Protected layout/routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout mode={mode} toggleTheme={toggleTheme} />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="tokens" element={<TokenList />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Admin Protected routes embedded inside main wrapper if accessed */}
              <Route
                path="users"
                element={
                  <AdminRoute>
                    <UsersList />
                  </AdminRoute>
                }
              />
            </Route>

            {/* Fallbacks */}
            <Route path="/index.html" element={<Navigate to="/splash" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
