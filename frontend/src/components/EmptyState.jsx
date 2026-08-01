import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no items to show at the moment.',
  actionText,
  onActionClick,
  icon = <InboxIcon sx={{ fontSize: 60, color: 'text.secondary' }} />,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
        border: '1px dashed',
        borderColor: 'divider',
        my: 2,
      }}
    >
      <Box sx={{ mb: 2 }}>{icon}</Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxW: 400, mb: 3 }}>
        {description}
      </Typography>
      {actionText && onActionClick && (
        <Button variant="contained" color="primary" onClick={onActionClick} sx={{ borderRadius: '8px', px: 3 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
}
