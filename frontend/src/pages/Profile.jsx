import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Divider,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ShieldIcon from '@mui/icons-material/Shield';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card sx={{ borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {/* Banner strip */}
        <Box sx={{ height: 100, bgcolor: 'primary.main' }} />
        
        <CardContent sx={{ position: 'relative', px: 4, pb: 4, pt: 0 }}>
          {/* Shift Avatar up over the banner */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              src={user.photoURL || user.profilePicture}
              alt={user.name}
              sx={{
                width: 100,
                height: 100,
                border: '4px solid',
                borderColor: 'background.paper',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                marginTop: '-50px',
              }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {user.email}
            </Typography>

            <Chip
              label={user.role.toUpperCase()}
              color={user.role === 'admin' ? 'secondary' : 'primary'}
              icon={user.role === 'admin' ? <ShieldIcon /> : <PersonIcon />}
              sx={{ fontWeight: 'bold', px: 1 }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                AUTHENTICATED BY
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5 }}>
                Google OAuth 2.0
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                ACCOUNT STATUS
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="success.main" sx={{ mt: 0.5 }}>
                Active Session
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
              sx={{ borderRadius: '12px', px: 4, py: 1, textTransform: 'none' }}
            >
              Sign out from System
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
