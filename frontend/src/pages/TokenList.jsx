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
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  TextField,
  Pagination,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchBar from '../components/SearchBar';
import ConfirmationDialog from '../components/ConfirmationDialog';
import TokenFormDialog from '../components/TokenFormDialog';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import {
  fetchTokensAPI,
  updateTokenAPI,
  deleteTokenAPI,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TokenList() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('createdAt:desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dialogs states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState(null);
  
  const [formOpen, setFormOpen] = useState(false);
  const [tokenToEdit, setTokenToEdit] = useState(null);

  // Toast alert states
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const { user: currentUser, isAdmin: showAdminFeatures } = useAuth();

  const loadTokens = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
        search,
        status,
        sort,
      };
      if (startDate) params.startDate = `${startDate}T00:00:00.000Z`;
      if (endDate) params.endDate = `${endDate}T23:59:59.999Z`;

      const res = await fetchTokensAPI(params);
      setTokens(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
      showToast('Error loading tokens.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, [page, status, sort, startDate, endDate]);

  const handleSearchTrigger = () => {
    setPage(1);
    loadTokens();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setSort('createdAt:desc');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleStatusChange = async (tokenId, newStatus) => {
    try {
      await updateTokenAPI(tokenId, { status: newStatus });
      showToast(`Token status updated to ${newStatus.toUpperCase()}`, 'success');
      loadTokens();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleCancelClick = async (token) => {
    try {
      await updateTokenAPI(token._id, { status: 'cancelled' });
      showToast('Token cancelled successfully.', 'success');
      loadTokens();
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel token.', 'error');
    }
  };

  const handleDeleteClick = (token) => {
    setTokenToDelete(token);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tokenToDelete) return;
    try {
      await deleteTokenAPI(tokenToDelete._id);
      showToast('Token successfully deleted.', 'success');
      setConfirmOpen(false);
      loadTokens();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete token.', 'error');
    }
  };

  const handleEditClick = (token) => {
    setTokenToEdit(token);
    setFormOpen(true);
  };

  const handleEditSubmit = async (tokenData) => {
    if (!tokenToEdit) return;
    try {
      await updateTokenAPI(tokenToEdit._id, tokenData);
      showToast('Token details updated.', 'success');
      setFormOpen(false);
      loadTokens();
    } catch (err) {
      console.error(err);
      showToast('Failed to edit token details.', 'error');
    }
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const getStatusBgColor = (statVal) => {
    switch (statVal) {
      case 'pending':
        return '#FFF3E0'; // Light Orange
      case 'preparing':
        return '#FFE0B2'; // Orange
      case 'ready':
        return '#E8F5E9'; // Light Green
      case 'served':
        return '#E3F2FD'; // Light Blue
      case 'cancelled':
        return '#FFEBEE'; // Light Red
      default:
        return '#F5F5F5';
    }
  };

  const getStatusTextColor = (statVal) => {
    switch (statVal) {
      case 'pending':
      case 'preparing':
        return '#E65100'; // Dark Orange
      case 'ready':
        return '#2E7D32'; // Dark Green
      case 'served':
        return '#1565C0'; // Dark Blue
      case 'cancelled':
        return '#C62828'; // Dark Red
      default:
        return '#757575';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        {showAdminFeatures ? 'Manage All Orders' : 'My Ordered Tokens'}
      </Typography>

      {/* Filters Card Panel */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Token or Item"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="preparing">Preparing</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="served">Served</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}>
                <MenuItem value="createdAt:desc">Date (Newest)</MenuItem>
                <MenuItem value="createdAt:asc">Date (Oldest)</MenuItem>
                <MenuItem value="totalAmount:desc">Price (Highest)</MenuItem>
                <MenuItem value="totalAmount:asc">Price (Lowest)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" fullWidth onClick={handleSearchTrigger} sx={{ py: 1.5, textTransform: 'none' }}>
                Filter
              </Button>
              <Tooltip title="Reset filters">
                <IconButton onClick={handleResetFilters} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {/* Date Filter Grid Section */}
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDate}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDate}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Main Table Content Container */}
      {loading ? (
        <SkeletonLoader type="list" />
      ) : tokens.length === 0 ? (
        <EmptyState
          title="No Tokens Found"
          description="Try broadening your search query or reset the filter parameters."
          actionText={!showAdminFeatures ? 'Order Food Now' : null}
          onActionClick={!showAdminFeatures ? () => setFormOpen(true) : null}
        />
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Token</TableCell>
                  {showAdminFeatures && <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>}
                  <TableCell sx={{ fontWeight: 'bold' }}>Food Item</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token._id} hover>
                    <TableCell fontWeight="bold" color="primary.main">
                      {token.tokenNumber}
                    </TableCell>
                    {showAdminFeatures && (
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {token.userId?.name || 'Deleted Account'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {token.userId?.email || 'N/A'}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell fontWeight="medium">{token.itemName}</TableCell>
                    <TableCell>{token.quantity}</TableCell>
                    <TableCell>₹{token.price.toFixed(2)}</TableCell>
                    <TableCell fontWeight="bold">₹{token.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {showAdminFeatures ? (
                        <FormControl size="small" sx={{ m: 0, minWidth: 110 }}>
                          <Select
                            value={token.status}
                            onChange={(e) => handleStatusChange(token._id, e.target.value)}
                            sx={{
                              borderRadius: '20px',
                              fontSize: 12,
                              fontWeight: 'bold',
                              bgcolor: getStatusBgColor(token.status),
                              color: getStatusTextColor(token.status),
                              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            }}
                          >
                            <MenuItem value="pending">PENDING</MenuItem>
                            <MenuItem value="preparing">PREPARING</MenuItem>
                            <MenuItem value="ready">READY</MenuItem>
                            <MenuItem value="served">SERVED</MenuItem>
                            <MenuItem value="cancelled">CANCELLED</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            bgcolor: getStatusBgColor(token.status),
                            color: getStatusTextColor(token.status),
                          }}
                        >
                          {token.status.toUpperCase()}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>
                      {new Date(token.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {showAdminFeatures ? (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Delete order permanently">
                            <IconButton color="error" onClick={() => handleDeleteClick(token)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          {/* Users can edit pending/preparing orders */}
                          {(token.status === 'pending' || token.status === 'preparing') && (
                            <>
                              <Tooltip title="Edit order items">
                                <IconButton color="primary" onClick={() => handleEditClick(token)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel order">
                                <IconButton color="error" onClick={() => handleCancelClick(token)}>
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {/* Users can delete cancelled/pending orders */}
                          {(token.status === 'pending' || token.status === 'cancelled') && (
                            <Tooltip title="Delete token record">
                              <IconButton color="default" onClick={() => handleDeleteClick(token)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Confirmation Delete Dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        title="Delete Token Permanently?"
        message={`Are you sure you want to delete token ${tokenToDelete?.tokenNumber}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Create/Edit Token Form Dialog */}
      <TokenFormDialog
        open={formOpen}
        token={tokenToEdit}
        onClose={() => {
          setFormOpen(false);
          setTokenToEdit(null);
        }}
        onSubmit={handleEditSubmit}
      />

      {/* Toast message snackbars */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
