import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { fetchTokensAPI, createTokenAPI, fetchMenuAPI, fetchCategoriesAPI } from '../services/api';

// Material UI Icons for Tailwind Layout
import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dynamic Menu and Categories State
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New order form fields
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  
  // Track token fields
  const [trackTokenNumber, setTrackTokenNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);

  useEffect(() => {
    loadUserTokens();
    loadMenuAndCategories();
  }, []);

  const loadMenuAndCategories = async () => {
    try {
      const menuRes = await fetchMenuAPI();
      setMenuItems(menuRes.data);
      const catRes = await fetchCategoriesAPI();
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching menu/categories:', err);
    }
  };

  const loadUserTokens = async () => {
    try {
      setLoading(true);
      const res = await fetchTokensAPI();
      setTokens(res.data.data);
    } catch (err) {
      console.error('Error fetching user tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || quantity <= 0) return;

    try {
      const tokenData = {
        itemName,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        totalAmount: parseInt(quantity) * parseFloat(price),
      };
      await createTokenAPI(tokenData);
      setItemName('');
      setQuantity(1);
      loadUserTokens();
      setActiveTab('orders');
    } catch (err) {
      console.error('Failed to create order token:', err);
    }
  };

  const handleTrackToken = (e) => {
    e.preventDefault();
    if (!trackTokenNumber.trim()) return;
    const found = tokens.find(t => t.tokenNumber === trackTokenNumber.trim());
    setTrackedOrder(found || null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navMenuItems = [
    { id: 'home', text: 'Home', icon: <HomeIcon /> },
    { id: 'menu', text: "Today's Menu", icon: <RestaurantMenuIcon /> },
    { id: 'orders', text: 'My Orders', icon: <ReceiptLongIcon /> },
    { id: 'track', text: 'Track Token', icon: <TrackChangesIcon /> },
    { id: 'history', text: 'Order History', icon: <HistoryIcon /> },
    { id: 'profile', text: 'Profile', icon: <AccountCircleIcon /> },
    { id: 'settings', text: 'Settings', icon: <SettingsIcon /> },
  ];

  // Helper stats
  const activeOrders = tokens.filter(t => ['pending', 'preparing', 'ready'].includes(t.status));
  const completedOrders = tokens.filter(t => t.status === 'served');
  const totalSpent = tokens.reduce((acc, t) => acc + (t.status === 'served' ? t.totalAmount : 0), 0);

  return (
    <div className="min-h-screen bg-[#0e0f14] text-white flex">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#12131a] border-r border-white/5 transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col`}>
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <span className="text-xl font-bold flex items-center gap-2">
            🍔 CMS Canteen
          </span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">✕</button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
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

      {/* Main Content container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#12131a]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white">
              <MenuIcon />
            </button>
            <h1 className="text-lg font-bold capitalize">{activeTab}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white relative">
              <NotificationsIcon />
              {activeOrders.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 h-2.5 w-2.5 rounded-full"></span>}
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
              <img src={user?.photoURL || 'https://via.placeholder.com/150'} alt="Avatar" className="w-8 h-8 rounded-full border border-blue-500" />
            </div>
          </div>
        </header>

        {/* Dashboard Pages */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Welcome banner */}
              <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl">🍔</div>
                <h2 className="text-3xl font-extrabold mb-2">Welcome back, {user?.name}! 👋</h2>
                <p className="text-blue-100 max-w-md">Hungry? Check today's fresh menu and place your order securely with a single token.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-[#12131a] rounded-2xl border border-white/5">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Active Orders</span>
                  <span className="text-3xl font-extrabold text-blue-500">{activeOrders.length}</span>
                </div>
                <div className="p-6 bg-[#12131a] rounded-2xl border border-white/5">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Completed Orders</span>
                  <span className="text-3xl font-extrabold text-green-500">{completedOrders.length}</span>
                </div>
                <div className="p-6 bg-[#12131a] rounded-2xl border border-white/5">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Spent</span>
                  <span className="text-3xl font-extrabold text-indigo-500">₹{totalSpent.toFixed(2)}</span>
                </div>
              </div>

              {/* Fast Order Form */}
              <div className="bg-[#12131a] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Fast Order Food Token</h3>
                <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Select Item</label>
                    <select
                      value={itemName}
                      onChange={(e) => {
                        setItemName(e.target.value);
                        const selectedFood = menuItems.find(m => m.name === e.target.value);
                        setPrice(selectedFood ? selectedFood.price : 0);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-[#1e1f29] px-4 py-2.5 text-sm outline-none text-white"
                    >
                      <option value="">-- Choose Food --</option>
                      {menuItems.filter(m => m.isAvailable).map(m => (
                        <option key={m._id} value={m.name}>
                          {m.name} (₹{m.price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#1e1f29] px-4 py-2.5 text-sm outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Token Total</label>
                    <input
                      type="text"
                      disabled
                      value={`₹${(quantity * price).toFixed(2)}`}
                      className="w-full rounded-xl border border-white/10 bg-[#1e1f29]/50 px-4 py-2.5 text-sm outline-none text-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold transition duration-200"
                  >
                    Generate Token
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-6">
              {/* Category Filter Badges */}
              <div className="flex flex-wrap gap-2 pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-[#12131a] text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  All Items
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${selectedCategory === cat._id ? 'bg-blue-600 text-white' : 'bg-[#12131a] text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Menu items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems
                  .filter(item => item.isAvailable && (selectedCategory === 'all' || item.category?._id === selectedCategory))
                  .map(item => (
                    <div key={item._id} className="bg-[#12131a] rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between">
                      {item.imageURL && (
                        <div className="h-40 overflow-hidden relative">
                          <img src={item.imageURL} alt={item.name} className="w-full h-full object-cover" />
                          <span className="absolute top-3 right-3 text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {item.category?.name || 'Food'}
                          </span>
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {!item.imageURL && (
                            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-2 inline-block">
                              {item.category?.name || 'Food'}
                            </span>
                          )}
                          <h4 className="text-lg font-bold">{item.name}</h4>
                          <p className="text-sm text-gray-400 mt-1 mb-4">Freshly prepared canteen selection.</p>
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-xl font-black text-blue-500">₹{item.price.toFixed(2)}</span>
                          <button
                            onClick={() => {
                              setItemName(item.name);
                              setPrice(item.price);
                              setQuantity(1);
                              setActiveTab('home');
                            }}
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-xl text-xs font-extrabold transition"
                          >
                            Quick Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {menuItems.filter(item => item.isAvailable && (selectedCategory === 'all' || item.category?._id === selectedCategory)).length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    No available items found in this category.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-[#12131a] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold">Active Orders & Food Tokens</h3>
                <button onClick={loadUserTokens} className="text-xs font-semibold text-blue-400 hover:underline">Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Token #</th>
                      <th className="px-6 py-3">Item</th>
                      <th className="px-6 py-3">Qty</th>
                      <th className="px-6 py-3">Total Amount</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {tokens.map(token => (
                      <tr key={token._id} className="hover:bg-white/2">
                        <td className="px-6 py-4 font-mono font-bold text-blue-400">{token.tokenNumber}</td>
                        <td className="px-6 py-4">{token.itemName}</td>
                        <td className="px-6 py-4">{token.quantity}</td>
                        <td className="px-6 py-4 font-bold">₹{token.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                            token.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                            token.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                            token.status === 'served' ? 'bg-blue-500/20 text-blue-400' :
                            token.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {token.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {tokens.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                          You have no orders yet. Go to Today's Menu to place an order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'track' && (
            <div className="max-w-md mx-auto bg-[#12131a] border border-white/5 rounded-2xl p-6 text-center space-y-6">
              <h3 className="text-xl font-bold">Track Meal Token Status</h3>
              <form onSubmit={handleTrackToken} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter Token Number (e.g. TOK-123)"
                  value={trackTokenNumber}
                  onChange={(e) => setTrackTokenNumber(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-[#1e1f29] px-4 py-2.5 text-sm outline-none text-white text-center font-mono uppercase"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl font-bold transition">Track</button>
              </form>

              {trackedOrder ? (
                <div className="p-6 border border-white/5 bg-[#191b24] rounded-xl text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold font-mono text-blue-400">{trackedOrder.tokenNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                      trackedOrder.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                      trackedOrder.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                      trackedOrder.status === 'served' ? 'bg-blue-500/20 text-blue-400' :
                      trackedOrder.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {trackedOrder.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{trackedOrder.itemName}</h4>
                    <p className="text-sm text-gray-400">Qty: {trackedOrder.quantity} • Total: ₹{trackedOrder.totalAmount.toFixed(2)}</p>
                  </div>
                  {/* Status Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Received</span>
                      <span>Preparing</span>
                      <span>Ready</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className={`h-full bg-blue-600 transition-all ${
                        trackedOrder.status === 'pending' ? 'w-1/3' :
                        trackedOrder.status === 'preparing' ? 'w-2/3' :
                        trackedOrder.status === 'ready' || trackedOrder.status === 'served' ? 'w-full' : 'w-0'
                      }`}></div>
                    </div>
                  </div>
                </div>
              ) : (
                trackTokenNumber && <p className="text-sm text-gray-500">No token found or invalid number.</p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-[#12131a] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="font-bold">Canteen Order History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Token #</th>
                      <th className="px-6 py-3">Item Name</th>
                      <th className="px-6 py-3">Total Cost</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                    {tokens.filter(t => ['served', 'cancelled'].includes(t.status)).map(token => (
                      <tr key={token._id}>
                        <td className="px-6 py-4">{new Date(token.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-mono font-bold">{token.tokenNumber}</td>
                        <td className="px-6 py-4">{token.itemName} (x{token.quantity})</td>
                        <td className="px-6 py-4 font-bold">₹{token.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            token.status === 'served' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {token.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {tokens.filter(t => ['served', 'cancelled'].includes(t.status)).length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          No historical orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-xl mx-auto bg-[#12131a] border border-white/5 rounded-2xl p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <img src={user?.photoURL || 'https://via.placeholder.com/150'} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-blue-500" />
                <div>
                  <h3 className="text-xl font-bold">{user?.name}</h3>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">{user?.role}</span>
                </div>
              </div>
              <div className="border-t border-white/5 pt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email Address</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Login Provider</span>
                  <span className="capitalize">{user?.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Firebase User UID</span>
                  <span className="font-mono text-xs">{user?.uid}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto bg-[#12131a] border border-white/5 rounded-2xl p-8 space-y-6">
              <h3 className="text-lg font-bold border-b border-white/5 pb-4">Settings Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer py-2">
                  <span className="text-sm font-semibold">Email notifications on order status</span>
                  <input type="checkbox" defaultChecked className="accent-blue-600" />
                </label>
                <label className="flex items-center justify-between cursor-pointer py-2">
                  <span className="text-sm font-semibold">Dark theme mode</span>
                  <input type="checkbox" defaultChecked disabled className="accent-blue-600" />
                </label>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
