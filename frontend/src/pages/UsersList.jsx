import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import PersonIcon from '@mui/icons-material/Person';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { fetchUsersAPI } from '../services/api';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const res = await fetchUsersAPI();
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  if (loading) {
    return <SkeletonLoader type="list" />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Registered User Accounts
      </Typography>

      {users.length === 0 ? (
        <EmptyState title="No registered users found" description="Users will appear here after their first sign-in." />
      ) : (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
        >
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Profile</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Google ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Joined Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Avatar src={user.photoURL || user.profilePicture} alt={user.name} />
                  </TableCell>
                  <TableCell fontWeight="medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell color="text.secondary" sx={{ fontSize: 13 }}>
                    {user.uid || user.googleId || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.role.toUpperCase()}
                      color={user.role === 'admin' ? 'secondary' : 'default'}
                      icon={user.role === 'admin' ? <ShieldIcon sx={{ fontSize: 14 }} /> : <PersonIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
