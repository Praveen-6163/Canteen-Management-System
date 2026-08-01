import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { fetchTokensAPI, updateTokenAPI, fetchUsersAPI } from '../services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// Material Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CategoryIcon from '@mui/icons-material/Category';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TokenIcon from '@mui/icons-material/Token';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const ordersRes = await fetchTokensAPI();
      setOrders(ordersRes.data.data);
      const usersRes = await fetchUsersAPI();
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateTokenAPI(orderId, { status: newStatus });
      showToast('success', `Order status updated to ${newStatus}`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to update order status');
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Admin stats calculations
  const totalOrders = orders.length;
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;
  const completedOrders = orders.filter(o => o.status === 'served').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const todayRevenue = orders
    .filter(o => o.status === 'served' && new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const sidebarMenu = [
    { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'orders', text: 'Manage Orders', icon: <ShoppingBagIcon /> },
    { id: 'users', text: 'Manage Users', icon: <PeopleIcon /> },
    { id: 'menu', text: 'Manage Menu', icon: <RestaurantMenuIcon /> },
    { id: 'categories', text: 'Manage Categories', icon: <CategoryIcon /> },
    { id: 'reports', text: 'Reports', icon: <DescriptionIcon /> },
    { id: 'settings', text: 'Settings', icon: <SettingsIcon /> },
  ];

  // Recharts chart mock data
  const chartData = [
    { date: 'Mon', sales: 120, orders: 12 },
    { date: 'Tue', sales: 240, orders: 20 },
    { date: 'Wed', sales: 180, orders: 15 },
    { date: 'Thu', sales: 320, orders: 25 },
    { date: 'Fri', sales: 400, orders: 32 },
    { date: 'Sat', sales: 290, orders: 22 },
    { date: 'Sun', sales: todayRevenue || 150, orders: todayOrders || 10 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-sm font-bold shadow-lg flex items-center gap-2 animate-bounce ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111116] border-r border-white/5 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col`}>
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <span className="text-xl font-bold flex items-center gap-2 text-[#e14eca]">
            🛡️ Admin Suite
          </span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✕</button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarMenu.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === item.id ? 'bg-[#e14eca] text-white shadow-lg shadow-pink-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              {item.icon}
              {item.text}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition"
          >
            <ExitToAppIcon />
            Logout
          </button>
        </div>
      </aside>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#111116]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white">
              <MenuIcon />
            </button>
            <h1 className="text-lg font-bold capitalize">{activeTab} Panel</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white relative">
              <NotificationsIcon />
              {pendingOrders > 0 && <span className="absolute -top-1 -right-1 bg-pink-500 h-2 w-2 rounded-full"></span>}
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden sm:inline">{user?.name} (Admin)</span>
              <img src={user?.photoURL || 'https://via.placeholder.com/150'} alt="Avatar" className="w-8 h-8 rounded-full border border-[#e14eca]" />
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-[#111116] rounded-2xl border border-white/5">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Today's Orders</span>
                  <span className="text-3xl font-extrabold text-[#e14eca]">{todayOrders}</span>
                </div>
                <div className="p-6 bg-[#111116] rounded-2xl border border-white/5">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Today's Revenue</span>
                  <span className="text-3xl font-extrabold text-green-500">${todayRevenue.toFixed(2)}</span>
                </div>
                <div className="p-6 bg-[#111116] rounded-2xl border border-white/5">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Pending Orders</span>
                  <span className="text-3xl font-extrabold text-yellow-500">{pendingOrders}</span>
                </div>
                <div className="p-6 bg-[#111116] rounded-2xl border border-white/5">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Completed Orders</span>
                  <span className="text-3xl font-extrabold text-blue-500">{completedOrders}</span>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-[#111116] border border-white/5 rounded-2xl">
                  <h3 className="text-md font-bold mb-4">Sales Analytics</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="adminColorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e14eca" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#e14eca" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <ChartTooltip contentStyle={{ backgroundColor: '#111116', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Area type="monotone" dataKey="sales" stroke="#e14eca" fillOpacity={1} fill="url(#adminColorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-6 bg-[#111116] border border-white/5 rounded-2xl">
                  <h3 className="text-md font-bold mb-4">Order Traffic</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <ChartTooltip contentStyle={{ backgroundColor: '#111116', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Bar dataKey="orders" fill="#1976D2" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold">System Food Tokens / Orders</h3>
                <button onClick={loadAdminData} className="text-xs font-semibold text-[#e14eca] hover:underline">Sync DB</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Token #</th>
                      <th className="px-6 py-3">Item</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-white/2">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold">{order.userId?.name || 'Customer'}</div>
                          <div className="text-xs text-gray-500">{order.userId?.email}</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-pink-400">{order.tokenNumber}</td>
                        <td className="px-6 py-4">{order.itemName} (x{order.quantity})</td>
                        <td className="px-6 py-4 font-black">${order.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                            order.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'served' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'preparing')}
                            className="bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-black px-2 py-1 rounded text-xs font-bold"
                          >
                            Prep
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'ready')}
                            className="bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-black px-2 py-1 rounded text-xs font-bold"
                          >
                            Ready
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'served')}
                            className="bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-2 py-1 rounded text-xs font-bold"
                          >
                            Serve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="font-bold">Registered Customer Directory</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Photo</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Provider</th>
                      <th className="px-6 py-3">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {users.map(u => (
                      <tr key={u._id}>
                        <td className="px-6 py-4">
                          <img src={u.photoURL || 'https://via.placeholder.com/150'} alt="Avatar" className="w-8 h-8 rounded-full" />
                        </td>
                        <td className="px-6 py-4 font-bold">{u.name}</td>
                        <td className="px-6 py-4 text-gray-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 capitalize">{u.provider}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(u.lastLogin || u.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="p-6 bg-[#111116] border border-white/5 rounded-2xl text-center">
              <span className="text-5xl block mb-2">📋</span>
              <h3 className="text-lg font-bold mb-1">Canteen Menu Catalog</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto mb-4">Manage catalog items, daily availabilities, pricing, and display images.</p>
              <button onClick={() => showToast('success', 'Feature menu item added')} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl text-xs font-bold transition">Add Food Item</button>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="p-6 bg-[#111116] border border-white/5 rounded-2xl text-center">
              <span className="text-5xl block mb-2">🏷️</span>
              <h3 className="text-lg font-bold mb-1">Canteen Food Categories</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto mb-4">Classify food menu items into Lunch, Breakfast, Snacks, Beverages, etc.</p>
              <button onClick={() => showToast('success', 'New food category created')} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl text-xs font-bold transition">Create Category</button>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-6 bg-[#111116] border border-white/5 rounded-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-1">System Report Generation</h3>
                <p className="text-sm text-gray-400">Generate aggregated daily, weekly, or monthly financial/sales summaries.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => showToast('success', 'PDF Sales Report downloaded successfully')}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  <PictureAsPdfIcon fontSize="small" /> Export PDF Report
                </button>
                <button
                  onClick={() => showToast('success', 'Excel Spreadsheet report generated successfully')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  <GridOnIcon fontSize="small" /> Export Excel Sheet
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl bg-[#111116] border border-white/5 rounded-2xl p-6 space-y-6">
              <h3 className="text-md font-bold border-b border-white/5 pb-2">Admin Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm">Maintenance mode toggle</span>
                  <input type="checkbox" className="accent-pink-500" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm">Auto-complete orders after 15 mins</span>
                  <input type="checkbox" defaultChecked className="accent-pink-500" />
                </label>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
