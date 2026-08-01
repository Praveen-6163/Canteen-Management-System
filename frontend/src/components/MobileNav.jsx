import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const showAdminMenu = user?.role === 'admin';

  // Find active tab value based on path
  const getValue = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/tokens') return 1;
    if (path === '/profile') return 2;
    if (path === '/users') return 3;
    return 0;
  };

  const handleNavigation = (newValue) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/tokens');
        break;
      case 2:
        navigate('/profile');
        break;
      case 3:
        navigate('/users');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getValue()}
        onChange={(event, newValue) => handleNavigation(newValue)}
        showLabels
      >
        <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
        <BottomNavigationAction label="My Tokens" icon={<ReceiptIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        {showAdminMenu && (
          <BottomNavigationAction label="Users" icon={<PeopleIcon />} />
        )}
      </BottomNavigation>
    </Paper>
  );
}
