import jwt from 'jsonwebtoken';
import User from '../models/User.js';
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
 * @desc    Verify Google ID Token, find or create user in MongoDB, and issue JWT
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
    
    const { name, email, sub: googleId, picture: profilePicture } = payload;

    let targetRole = 'user';
    
    // Check if email matches configured admin email
    if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
      targetRole = 'admin';
    }

    // Look for existing user by email
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user in database
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture,
        role: targetRole,
      });
      console.log(`Successfully registered new Google user: ${email}`);
    } else {
      // Update existing user profile information from Google
      user.name = name;
      user.profilePicture = profilePicture;
      user.googleId = googleId;
      if (targetRole === 'admin') {
        user.role = 'admin';
      }
      await user.save();
      console.log(`Successfully authenticated existing Google user: ${email}`);
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
    console.error('Google Auth Controller Error:', error);
    res.status(401).json({ message: error.message || 'Google Authentication failed' });
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
        profilePicture: user.profilePicture,
        role: user.role,
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
