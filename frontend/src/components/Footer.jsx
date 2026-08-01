import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 4, mt: 'auto', borderTop: '1px solid #e0e0e0' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' Canteen Management System. All rights reserved.'}
        </Typography>
      </Container>
    </Box>
  );
}
