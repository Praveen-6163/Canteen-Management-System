import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Setup OAuth2 client if CLIENT_ID is present
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// Ensure in-memory list exists
if (!global.inMemoryUsers) {
  global.inMemoryUsers = [];
}

// @desc    Auth user / Login with Google or Demo fallback
// @route   POST /api/users/login
// @access  Public
export const authUser = async (req, res) => {
  const { credential, mockUser } = req.body;

  try {
    let name, email, googleId, profilePicture;
    let targetRole = 'user';

    // Check if we are running in Mock Demo mode
    if (mockUser || !process.env.GOOGLE_CLIENT_ID || (credential && credential.startsWith('demo_'))) {
      // Demo/Mock login mode
      console.log('Using Mock/Demo authentication mode');
      const userPayload = mockUser || {
        name: 'Demo Customer',
        email: 'demo.customer@example.com',
        googleId: 'demo_customer_12345',
        profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: 'user'
      };

      name = userPayload.name;
      email = userPayload.email;
      googleId = userPayload.googleId;
      profilePicture = userPayload.profilePicture;
      targetRole = userPayload.role || 'user';
    } else {
      // Production Google OAuth mode
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      name = payload.name;
      email = payload.email;
      googleId = payload.sub;
      profilePicture = payload.picture;

      // Check if email belongs to configured admin list (e.g. system env)
      if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
        targetRole = 'admin';
      }
    }

    let user;

    if (global.useInMemoryDb) {
      // In-Memory Fallback Check
      user = global.inMemoryUsers.find((u) => u.email === email);
      if (!user) {
        user = {
          _id: `inmem_u_${Date.now()}_${Math.random().toString().slice(-4)}`,
          name,
          email,
          googleId,
          profilePicture,
          role: targetRole,
          createdAt: new Date(),
        };
        global.inMemoryUsers.push(user);
      } else {
        user.name = name;
        user.profilePicture = profilePicture;
        if (targetRole === 'admin') user.role = 'admin';
      }
    } else {
      // Standard database check
      user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name,
          email,
          googleId,
          profilePicture,
          role: targetRole,
        });
      } else {
        user.name = name;
        user.profilePicture = profilePicture;
        if (targetRole === 'admin') {
          user.role = 'admin';
        }
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Google Auth token verification failed' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  let user;

  if (global.useInMemoryDb) {
    user = global.inMemoryUsers.find((u) => u._id.toString() === req.user._id.toString());
  } else {
    user = await User.findById(req.user._id);
  }

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    if (global.useInMemoryDb) {
      res.json(global.inMemoryUsers);
    } else {
      const users = await User.find({}).sort({ createdAt: -1 });
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
