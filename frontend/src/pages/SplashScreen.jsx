import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated()) {
        navigate('/');
      } else {
        navigate('/login');
      }
    }, 1500); // 1.5 seconds splash effect

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: 'background.default',
        textAlign: 'center',
      }}
    >
      <Box sx={{ mb: 4, transform: 'scale(1.2)', transition: 'transform 0.5s ease' }}>
        <Typography variant="h2" component="div" sx={{ mb: 1 }}>
          🍔
        </Typography>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
          CMS Canteen
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: 2, mt: 1 }}>
          MANAGEMENT SYSTEM
        </Typography>
      </Box>
      <CircularProgress size={30} thickness={4} color="primary" />
    </Box>
  );
}
