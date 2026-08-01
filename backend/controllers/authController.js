import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { verifyGoogleToken } from '../services/authService.js';

/**
 * Generates a JWT token signed with the user ID
 * @param {string} id - User Mongoose ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured in backend env');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Verify Firebase ID Token, find or create user in MongoDB, and issue JWT
 * @route   POST /api/users/login
 * @access  Public
 */
export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential ID token is required' });
  }

  try {
    const payload = await verifyGoogleToken(credential);
    
    const { name, email, uid, photoURL, provider } = payload;

    let targetRole = 'user';
    
    // Check if email exists in the admins collection
    const adminRecord = await Admin.findOne({ email });
    if (adminRecord) {
      targetRole = 'admin';
    }

    // Look for existing user by email
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user in database
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        uid,
        photoURL,
        provider,
        role: targetRole,
        lastLogin: new Date(),
      });
      console.log(`Successfully registered new Firebase user: ${email} (${provider}) as ${targetRole}`);
    } else {
      // Update existing user profile information and role
      if (name) user.name = name;
      if (photoURL) user.photoURL = photoURL;
      user.uid = uid;
      user.provider = provider;
      user.role = targetRole; // Sync role dynamically in case list of admins has changed
      user.lastLogin = new Date();
      await user.save();
      console.log(`Successfully authenticated existing Firebase user: ${email} (${provider}) as ${targetRole}`);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
      provider: user.provider,
      uid: user.uid,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Firebase Auth Controller Error:', error);
    res.status(401).json({ message: error.message || 'Authentication failed' });
  }
};

/**
 * @desc    Get user profile details
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        provider: user.provider,
        uid: user.uid,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all registered users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
