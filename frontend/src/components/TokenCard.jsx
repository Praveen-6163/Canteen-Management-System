import React from 'react';
import { Card, CardContent, Typography, CardActions, Button, Chip, Box } from '@mui/material';

export default function TokenCard({ token, onUpdate, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
        return 'warning';
      case 'ready':
        return 'success';
      case 'served':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ minWidth: 270, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="primary.main" fontWeight="bold">
            {token.tokenNumber}
          </Typography>
          <Chip
            label={token.status.toUpperCase()}
            color={getStatusColor(token.status)}
            size="small"
            sx={{ fontWeight: 'bold', fontSize: '10px' }}
          />
        </Box>
        <Typography variant="h6" fontWeight="bold" component="div">
          {token.itemName}
        </Typography>
        <Typography sx={{ my: 0.5 }} color="text.secondary" variant="body2">
          Price: ₹{token.price.toFixed(2)} x {token.quantity}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Total Price
          </Typography>
          <Typography variant="body1" fontWeight="bold" color="text.primary">
            ₹{token.totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        {(token.status === 'pending' || token.status === 'preparing') && onDelete && (
          <Button size="small" color="error" onClick={() => onDelete(token._id)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
