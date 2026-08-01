import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function Layout({ mode, toggleTheme }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Sticky Top Header */}
      <Navbar
        onDrawerToggle={handleDrawerToggle}
        mode={mode}
        toggleTheme={toggleTheme}
        isMobile={isMobile}
      />

      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Desktop Sidebar drawer */}
        {!isMobile && (
          <Sidebar open={sidebarOpen} drawerWidth={drawerWidth} />
        )}

        {/* Content Panel */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
            ml: { sm: sidebarOpen ? 0 : 0 },
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            bgcolor: 'background.default',
            pb: isMobile ? 10 : 3, // Prevent overlap with Mobile bottom nav
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}

      {/* Footer */}
      {!isMobile && <Footer />}
    </Box>
  );
}
