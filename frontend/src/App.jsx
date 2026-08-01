import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, GuestRoute, AdminGuestRoute } from './components/RouteGuards';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SplashScreen from './pages/SplashScreen';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Initial loading screen check */}
          <Route path="/splash" element={<SplashScreen />} />

          {/* User Sign-In/Sign-Up pages */}
          <Route
            path="/"
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

          {/* Admin Sign-In page */}
          <Route
            path="/admin/login"
            element={
              <AdminGuestRoute>
                <AdminLogin />
              </AdminGuestRoute>
            }
          />

          {/* User Dashboard Workspaces */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Control Suite */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Unified Redirects for legacy routes */}
          <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
          <Route path="/orders" element={<Navigate to="/dashboard" replace />} />
          <Route path="/menu" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          
          {/* Vercel static router matching */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/index.html" element={<Navigate to="/splash" replace />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
