import express from 'express';
import {
  googleLogin,
  getUserProfile,
  getUsers,
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', googleLogin);
router.get('/profile', protect, getUserProfile);
router.get('/', protect, adminOnly, getUsers);

export default router;
