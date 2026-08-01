import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';

export default function Loader({ message = 'Loading...', type = 'full' }) {
  if (type === 'linear') {
    return (
      <Box sx={{ width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1100 }}>
        <LinearProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: type === 'page' ? '70vh' : '100vh',
        width: '100%',
        gap: 2,
      }}
    >
      <CircularProgress size={50} thickness={4} color="primary" />
      {message && (
        <Typography variant="body1" color="text.secondary" fontWeight="medium">
          {message}
        </Typography>
      )}
    </Box>
  );
}
