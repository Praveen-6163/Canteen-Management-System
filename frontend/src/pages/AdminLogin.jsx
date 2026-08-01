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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { loginAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessDeniedOpen, setAccessDeniedOpen] = useState(false);

  // If already authenticated as an Admin, redirect to Admin Dashboard
  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleAdminVerify = async (userEmail, token) => {
    if (userEmail !== 'praveenmedida42@gmail.com') {
      // Access Denied: Immediate Firebase Sign-out and session clearance
      await signOut(auth);
      logout();
      setAccessDeniedOpen(true);
      return;
    }

    // Call backend to sync login
    const res = await loginAPI(token);
    if (res.data.role !== 'admin') {
      await signOut(auth);
      logout();
      setAccessDeniedOpen(true);
    } else {
      login(res.data, res.data.token);
      navigate('/admin/dashboard');
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken(true);
      await handleAdminVerify(result.user.email, token);
    } catch (err) {
      console.error('Admin Email sign in error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid admin credentials.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.response?.data?.message || err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await handleAdminVerify(result.user.email, token);
    } catch (err) {
      console.error('Admin Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup closed.');
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
        bgcolor: '#1a1a2e',
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
                Authorized Administration access only.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleEmailSignIn}>
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
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In as Admin'}
              </Button>
            </form>

            <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(255,255,255,0.1)' } }}>
              <Typography variant="caption" sx={{ color: '#b3b3b3', fontWeight: 'bold' }}>
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 'bold',
                textTransform: 'none',
                borderColor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  borderColor: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </Container>

      {/* Professional Access Denied Popup Dialog */}
      <Dialog
        open={accessDeniedOpen}
        onClose={() => setAccessDeniedOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: '#27293d',
            color: '#fff',
            p: 1.5,
            border: '1px solid rgba(255,255,255,0.05)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#f44336', fontWeight: 'bold' }}>
          🛑 Access Denied
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#e0e0e0', mt: 1 }}>
            Access Denied. You are not authorized to access the Admin Dashboard.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setAccessDeniedOpen(false)}
            variant="contained"
            sx={{
              borderRadius: '10px',
              bgcolor: '#f44336',
              color: '#fff',
              '&:hover': { bgcolor: '#d32f2f' },
            }}
          >
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
