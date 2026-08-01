import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, Grid } from '@mui/material';

export default function TokenForm({ onSubmit, loading = false }) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!itemName.trim()) tempErrors.itemName = 'Food item name is required';
    if (!price || parseFloat(price) <= 0) tempErrors.price = 'Price must be > 0';
    if (parseInt(quantity, 10) < 1) tempErrors.quantity = 'Quantity must be >= 1';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      itemName,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
    });

    // Reset form after submission
    setItemName('');
    setQuantity(1);
    setPrice('');
  };

  const totalAmount = (parseInt(quantity, 10) || 0) * (parseFloat(price) || 0);

  return (
    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Order Food Token
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Food Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          error={!!errors.itemName}
          helperText={errors.itemName}
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              type="number"
              label="Price (₹)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={!!errors.price}
              helperText={errors.price}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              error={!!errors.quantity}
              helperText={errors.quantity}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Total Price:
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            ₹{totalAmount.toFixed(2)}
          </Typography>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ mt: 3, py: 1.25, borderRadius: '8px' }}
        >
          {loading ? 'Processing...' : 'Generate Token'}
        </Button>
      </Box>
    </Paper>
  );
}
