import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Navigate } from 'react-router-dom';
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

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await loginAPI(response.credential);
      login(res.data, res.data.token);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Sign In Error:', error);
    setError('Google Sign In was unsuccessful. Try again.');
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
                <Typography variant="body2" color="text.secondary">Authenticating with server...</Typography>
              </Box>
            ) : (
              <>
                {/* Google OAuth Login Component */}
                {googleClientId ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleFailure}
                      useOneTap
                      theme="filled_blue"
                      shape="pill"
                    />
                  </Box>
                ) : (
                  <Box sx={{ my: 3 }}>
                    <Alert severity="warning" sx={{ textAlign: 'left', borderRadius: '8px' }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                        Google OAuth not configured
                      </Typography>
                      Please set the <strong>VITE_GOOGLE_CLIENT_ID</strong> environment variable in your frontend <strong>.env</strong> file and restart the development server.
                    </Alert>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
