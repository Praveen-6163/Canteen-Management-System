import React from 'react';
import { Grid, Card, CardContent, Skeleton, Box } from '@mui/material';

export default function SkeletonLoader({ type = 'dashboard' }) {
  if (type === 'list') {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <Skeleton variant="rectangular" height={50} sx={{ mb: 2, borderRadius: '4px' }} />
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: '8px' }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 4 Cards Skeletons */}
      <Grid container spacing={3} mb={4}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={25} />
                <Skeleton variant="rectangular" height={40} sx={{ my: 1, borderRadius: '4px' }} />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Grid for Chart and Recent Orders */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: '12px', p: 2 }}>
            <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '8px' }} />
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', p: 2 }}>
            <Skeleton variant="text" width="50%" height={30} sx={{ mb: 2 }} />
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
