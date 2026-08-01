import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h1" fontWeight="bold" color="primary.main">
          404
        </Typography>
        <Typography variant="h5" fontWeight="semibold">
          Oops! Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2, borderRadius: '8px', px: 3, py: 1 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
}
