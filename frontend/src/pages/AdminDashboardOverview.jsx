import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchAnalyticsAPI } from '../services/api';
import AnalyticsCard from '../components/AnalyticsCard';

export default function AdminDashboardOverview() {
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetchAnalyticsAPI();
        setMetrics(res.data.metrics);
        setRecentOrders(res.data.recentOrders);
        setChartData(res.data.chartData);
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
        return 'warning';
      case 'ready':
        return 'success';
      case 'served':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Find today's revenue from chartData (the last item represents today)
  const todayRevenue = chartData.length > 0 ? chartData[chartData.length - 1].sales : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={50} color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, color: '#fff' }}>
        Admin Dashboard Overview
      </Typography>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <AnalyticsCard
            title="Total Users"
            value={metrics?.usersCount || 0}
            icon={<PeopleIcon />}
            color="#9C27B0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <AnalyticsCard
            title="Today's Orders"
            value={metrics?.todayOrders || 0}
            icon={<ShoppingBagIcon />}
            color="#E91E63"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <AnalyticsCard
            title="Today's Revenue"
            value={`₹${todayRevenue.toFixed(2)}`}
            icon={<AttachMoneyIcon />}
            color="#43A047"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <AnalyticsCard
            title="Pending Orders"
            value={metrics?.pending || 0}
            icon={<AccessTimeIcon />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <AnalyticsCard
            title="Completed Orders"
            value={metrics?.completed || 0}
            icon={<CheckCircleIcon />}
            color="#1976D2"
          />
        </Grid>
      </Grid>

      {/* Analytics Chart & Recent Orders List */}
      <Grid container spacing={3}>
        {/* Weekly Area Chart */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: '16px', bgcolor: '#27293d', color: '#fff', border: 'none', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#e0e0e0' }}>
                Weekly Sales & Order Analytics
              </Typography>
              <Box sx={{ width: '100%', height: 320, mt: 2 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="adminColorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e14eca" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#e14eca" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} stroke="rgba(255,255,255,0.5)" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} stroke="rgba(255,255,255,0.5)" />
                    <ChartTooltip contentStyle={{ backgroundColor: '#27293d', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#e14eca"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#adminColorSales)"
                      name="Revenue (₹)"
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#2391ff"
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

        {/* Recent Orders List Table */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: '16px', bgcolor: '#27293d', color: '#fff', border: 'none', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#e0e0e0' }}>
                Recent System Orders
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none', border: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' } }}>
                      <TableCell>Customer</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order._id} hover sx={{ '& td': { borderColor: 'rgba(255,255,255,0.05)', color: '#e0e0e0' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}>
                        <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={order.userId?.profilePicture || order.userId?.photoURL} alt={order.userId?.name} sx={{ width: 28, height: 28 }} />
                          <Typography variant="body2" sx={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.userId?.name || 'Customer'}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.itemName}</TableCell>
                        <TableCell fontWeight="bold">₹{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={order.status.toUpperCase()}
                            color={getStatusColor(order.status)}
                            sx={{ fontWeight: 'bold', fontSize: 10 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 4 }}>
                          No recent system orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
