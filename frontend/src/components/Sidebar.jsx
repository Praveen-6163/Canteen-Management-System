import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../services/auth';

export default function Sidebar({ open, drawerWidth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const showAdminMenu = isAdmin();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'My Tokens', icon: <ReceiptIcon />, path: '/tokens' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const adminItems = [
    { text: 'Manage Users', icon: <PeopleIcon />, path: '/users' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const renderList = (items) => (
    <List>
      {items.map((item) => {
        const isSelected = location.pathname === item.path;
        return (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isSelected}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: '8px',
                mx: 1,
                my: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: isSelected ? 'inherit' : 'text.secondary', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: isSelected ? 'bold' : 'normal' }} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* Spacer to push items below appbar */}
      <Toolbar />
      <Divider />
      {renderList(menuItems)}
      
      {showAdminMenu && (
        <>
          <Divider sx={{ my: 1 }} />
          {renderList(adminItems)}
        </>
      )}
    </Drawer>
  );
}
