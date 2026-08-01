import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { loginAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated as an Admin, redirect to Admin Dashboard
  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign in with Firebase Auth
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Retrieve secure Firebase ID Token
      const token = await result.user.getIdToken(true);
      
      // 3. Send token to backend to get JWT and profile info
      const res = await loginAPI(token);
      
      // 4. Validate that the user is an administrator
      if (res.data.role !== 'admin') {
        // Log them out of Firebase and clean session if standard user
        await signOut(auth);
        logout();
        setError('Access denied. This account does not have Admin permissions.');
      } else {
        // Store admin session and navigate to admin dashboard
        login(res.data, res.data.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Admin Login error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid admin credentials.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.response?.data?.message || err.message || 'An error occurred during Admin sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#1e1e2f', // Sleek dark themed background for admin
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card sx={{ borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.25)', p: 2, bgcolor: '#27293d', color: '#fff' }}>
          <CardContent>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h3" component="div">
                🛡️
              </Typography>
              <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mt: 1, color: '#e0e0e0' }}>
                Admin Portal
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: '#b3b3b3' }}>
                Secure access for CMS Administrators
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleAdminLogin}>
              <TextField
                fullWidth
                label="Admin Email"
                variant="outlined"
                margin="normal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputLabelProps={{ style: { color: '#b3b3b3' } }}
                inputProps={{ style: { color: '#fff' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#4f5060' },
                    '&:hover fieldset': { borderColor: '#1976D2' },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                margin="normal"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputLabelProps={{ style: { color: '#b3b3b3' } }}
                inputProps={{ style: { color: '#fff' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#4f5060' },
                    '&:hover fieldset': { borderColor: '#1976D2' },
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="secondary"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                  backgroundColor: '#e14eca',
                  '&:hover': {
                    backgroundColor: '#b83ba4',
                  },
                  boxShadow: '0 4px 14px 0 rgba(225, 78, 202, 0.4)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In as Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
