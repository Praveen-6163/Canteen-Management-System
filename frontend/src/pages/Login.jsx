import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { loginAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to Dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Trigger Google Popup Sign-in using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // Obtain the secure Firebase ID Token (JWT)
      const token = await result.user.getIdToken();
      
      // Send the token to backend for server-side verification
      const res = await loginAPI(token);
      
      // Store user and JWT details via Auth Context
      login(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      console.error('Firebase Auth Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup closed by user. Please try again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Google authentication failed.');
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
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card sx={{ borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', p: 2 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" component="div">
                🍔
              </Typography>
              <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mt: 1 }}>
                Welcome to CMS Canteen
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Order meals & track tokens effortlessly
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4, gap: 1 }}>
                <CircularProgress size={30} />
                <Typography variant="body2" color="text.secondary">Authenticating...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, width: '100%' }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleSignIn}
                  sx={{
                    py: 1.5,
                    borderRadius: '24px',
                    fontWeight: 'bold',
                    backgroundColor: '#1976D2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.4)',
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  Continue with Google
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
