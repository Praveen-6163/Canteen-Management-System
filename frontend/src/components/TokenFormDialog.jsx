import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
} from '@mui/material';

export default function TokenFormDialog({ open, onClose, token, onSubmit }) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (token) {
      setItemName(token.itemName || '');
      setQuantity(token.quantity || 1);
      setPrice(token.price || '');
    } else {
      setItemName('');
      setQuantity(1);
      setPrice('');
    }
    setErrors({});
  }, [token, open]);

  const validate = () => {
    const tempErrors = {};
    if (!itemName.trim()) tempErrors.itemName = 'Food item name is required';
    if (!price || parseFloat(price) <= 0) tempErrors.price = 'Price must be greater than 0';
    if (parseInt(quantity, 10) < 1) tempErrors.quantity = 'Quantity must be at least 1';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tokenData = {
      itemName,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
    };

    onSubmit(tokenData);
  };

  const totalAmount = (parseInt(quantity, 10) || 0) * (parseFloat(price) || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: '16px', p: 1 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {token ? 'Edit Token Details' : 'Generate New Food Token'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            </Grid>
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

          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: '8px', textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h5" color="primary.main" fontWeight="bold">
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ borderRadius: '8px' }}>
          {token ? 'Save Changes' : 'Generate Token'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
