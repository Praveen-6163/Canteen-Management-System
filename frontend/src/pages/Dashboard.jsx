import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Fab,
  Tooltip as MuiTooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from 'recharts';
import AnalyticsCard from '../components/AnalyticsCard';
import TokenFormDialog from '../components/TokenFormDialog';
import SkeletonLoader from '../components/SkeletonLoader';
import { fetchAnalyticsAPI, createTokenAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const { user, isAdmin: showAdminFeatures } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAnalyticsAPI();
      setMetrics(res.data.metrics);
      setRecentOrders(res.data.recentOrders);
      setChartData(res.data.chartData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateToken = async (tokenData) => {
    try {
      await createTokenAPI(tokenData);
      setFormOpen(false);
      loadData(); // Auto refresh
    } catch (err) {
      console.error('Error creating token:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
        return '#FF9800'; // Orange
      case 'ready':
        return '#4CAF50'; // Green
      case 'served':
        return '#2196F3'; // Blue
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray
    }
  };

  if (loading) {
    return <SkeletonLoader type="dashboard" />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Welcome back, {user?.name}! 👋
        </Typography>
      </Box>

      {/* Analytics Cards Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Total Orders"
            value={metrics?.totalOrders || 0}
            icon={<ShoppingBagIcon />}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Pending Orders"
            value={metrics?.pending || 0}
            icon={<AccessTimeIcon />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Served Orders"
            value={metrics?.completed || 0}
            icon={<CheckCircleIcon />}
            color="#43A047"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {showAdminFeatures ? (
            <AnalyticsCard
              title="Registered Users"
              value={metrics?.usersCount || 0}
              icon={<PeopleIcon />}
              color="#9C27B0"
            />
          ) : (
            <AnalyticsCard
              title="Today's Tokens"
              value={metrics?.todayOrders || 0}
              icon={<CurrencyExchangeIcon />}
              color="#E91E63"
            />
          )}
        </Grid>
      </Grid>

      {/* Charts & Recent Orders Table Grid */}
      <Grid container spacing={3}>
        {/* Weekly Analytics Chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Weekly Activity (Sales & Orders)
              </Typography>
              <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1976D2" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#1976D2" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#1976D2"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      name="Revenue (₹)"
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#43A047"
                      strokeWidth={2}
                      name="Orders Count"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders List */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Orders
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ mt: 1, maxHeight: 310, overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Token</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No tokens created yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.map((order) => (
                        <TableRow key={order._id} hover>
                          <TableCell fontWeight="medium">{order.tokenNumber}</TableCell>
                          <TableCell>{order.itemName}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.25,
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                color: 'white',
                                bgcolor: getStatusColor(order.status),
                              }}
                            >
                              {order.status.toUpperCase()}
                            </Box>
                          </TableCell>
                          <TableCell align="right" fontWeight="bold">
                            ₹{order.totalAmount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button for users to create a new token */}
      {!showAdminFeatures && (
        <MuiTooltip title="Generate New Token">
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => setFormOpen(true)}
            sx={{
              position: 'fixed',
              bottom: { xs: 70, sm: 24 }, // Push above bottom nav on mobile
              right: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <AddIcon />
          </Fab>
        </MuiTooltip>
      )}

      {/* Token Form Dialog */}
      <TokenFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateToken}
      />
    </Box>
  );
}
