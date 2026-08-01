import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import TokenCard from './TokenCard';

export default function TokenList({ tokens, onTokenUpdated, onTokenDeleted }) {
  if (!tokens || tokens.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No tokens available. Generate one to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {tokens.map((token) => (
        <Grid item xs={12} sm={6} md={4} key={token._id || token.id}>
          <TokenCard
            token={token}
            onUpdate={onTokenUpdated}
            onDelete={onTokenDeleted}
          />
        </Grid>
      ))}
    </Grid>
  );
}
