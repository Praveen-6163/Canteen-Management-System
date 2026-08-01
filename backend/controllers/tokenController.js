import Token from '../models/Token.js';
import User from '../models/User.js';

/**
 * Helper to generate next Token Number (e.g. T-1001, T-1002, etc.)
 */
const generateNextTokenNumber = async () => {
  try {
    const lastToken = await Token.findOne().sort({ createdAt: -1 });
    if (!lastToken || !lastToken.tokenNumber) {
      return 'T-1001';
    }
    const match = lastToken.tokenNumber.match(/^T-(\d+)$/);
    if (!match) {
      return `T-${Date.now().toString().slice(-4)}`;
    }
    const nextNum = parseInt(match[1], 10) + 1;
    return `T-${nextNum}`;
  } catch (error) {
    console.error('Error generating token number:', error);
    return `T-${Date.now().toString().slice(-4)}`;
  }
};

/**
 * @desc    Get all tokens with filters, search, sorting & pagination
 * @route   GET /api/tokens
 * @access  Private
 */
export const getTokens = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Standard users only see their own tokens
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    // Status filter
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    // Search filter (searches Token Number or Item Name, or Customer Name for Admins)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const searchConditions = [
        { tokenNumber: searchRegex },
        { itemName: searchRegex }
      ];

      if (req.user.role === 'admin') {
        const matchingUsers = await User.find({ name: searchRegex }).select('_id');
        const userIds = matchingUsers.map(u => u._id);
        searchConditions.push({ userId: { $in: userIds } });
      }

      query.$or = searchConditions;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Sorting parameters
    let sortBy = { createdAt: -1 };
    if (req.query.sort) {
      const parts = req.query.sort.split(':');
      sortBy = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
    }

    const total = await Token.countDocuments(query);
    const tokens = await Token.find(query)
      .populate('userId', 'name email profilePicture')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: tokens,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get token by ID
 * @route   GET /api/tokens/:id
 * @access  Private
 */
export const getTokenById = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id).populate('userId', 'name email');
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    // Access authorization check
    if (req.user.role !== 'admin' && token.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this token' });
    }

    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new token (Order submission)
 * @route   POST /api/tokens
 * @access  Private
 */
export const createToken = async (req, res) => {
  try {
    const { itemName, quantity, price } = req.body;

    if (!itemName || !quantity || !price) {
      return res.status(400).json({ message: 'Please provide itemName, quantity, and price' });
    }

    const tokenNumber = await generateNextTokenNumber();
    const totalAmount = quantity * price;

    const token = await Token.create({
      tokenNumber,
      itemName,
      quantity,
      price,
      totalAmount,
      status: 'pending',
      userId: req.user._id,
    });

    const populatedToken = await Token.findById(token._id).populate('userId', 'name email profilePicture');
    res.status(201).json(populatedToken);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Update token fields or status
 * @route   PUT /api/tokens/:id
 * @access  Private
 */
export const updateToken = async (req, res) => {
  try {
    const { itemName, quantity, price, status } = req.body;

    const token = await Token.findById(req.params.id);
    if (!token) return res.status(404).json({ message: 'Token not found' });

    if (req.user.role === 'admin') {
      // Admins can update any field & status
      if (status) token.status = status;
      if (itemName) token.itemName = itemName;
      if (quantity) {
        token.quantity = quantity;
        token.totalAmount = quantity * (price || token.price);
      }
      if (price) {
        token.price = price;
        token.totalAmount = (quantity || token.quantity) * price;
      }
    } else {
      // Normal users can only update their own tokens and only if they are not processed
      if (token.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this token' });
      }
      if (token.status !== 'pending' && token.status !== 'preparing') {
        return res.status(400).json({ message: 'Cannot modify token once order preparation begins' });
      }
      
      if (status && status === 'cancelled') {
        token.status = 'cancelled';
      } else {
        if (itemName) token.itemName = itemName;
        if (quantity) token.quantity = quantity;
        if (price) token.price = price;
        token.totalAmount = token.quantity * token.price;
      }
    }

    const updatedToken = await token.save();
    const populatedToken = await Token.findById(updatedToken._id).populate('userId', 'name email profilePicture');
    res.status(200).json(populatedToken);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Delete token
 * @route   DELETE /api/tokens/:id
 * @access  Private
 */
export const deleteToken = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);
    if (!token) return res.status(404).json({ message: 'Token not found' });

    if (req.user.role !== 'admin') {
      if (token.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this token' });
      }
      if (token.status !== 'pending' && token.status !== 'cancelled') {
        return res.status(400).json({ message: 'Cannot delete processed tokens. Cancel instead.' });
      }
    }

    await token.deleteOne();
    res.status(200).json({ message: 'Token successfully deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get dashboard metrics & aggregation stats
 * @route   GET /api/tokens/analytics
 * @access  Private
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    const matchFilter = {};
    if (req.user.role !== 'admin') {
      matchFilter.userId = req.user._id;
    }

    const totalOrders = await Token.countDocuments(matchFilter);
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const todayFilter = { ...matchFilter, createdAt: { $gte: startOfToday, $lte: endOfToday } };
    const todayOrders = await Token.countDocuments(todayFilter);

    const pendingOrders = await Token.countDocuments({ ...matchFilter, status: 'pending' });
    const preparingOrders = await Token.countDocuments({ ...matchFilter, status: 'preparing' });
    const readyOrders = await Token.countDocuments({ ...matchFilter, status: 'ready' });
    const completedOrders = await Token.countDocuments({ ...matchFilter, status: 'served' });
    const cancelledOrders = await Token.countDocuments({ ...matchFilter, status: 'cancelled' });

    const usersCount = req.user.role === 'admin' ? await User.countDocuments({}) : 1;

    const recentOrders = await Token.find(matchFilter)
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(6);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0,0,0,0);

    const salesHistory = await Token.aggregate([
      {
        $match: {
          ...matchFilter,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const match = salesHistory.find(item => item._id === dateString);
      
      chartData.push({
        date: dateString,
        orders: match ? match.orders : 0,
        sales: match ? match.sales : 0,
      });
    }

    res.status(200).json({
      metrics: {
        totalOrders,
        todayOrders,
        pending: pendingOrders + preparingOrders,
        ready: readyOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        usersCount,
      },
      recentOrders,
      chartData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
