import express from 'express';
import {
  authUser,
  getUserProfile,
  getUsers,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.get('/', protect, adminOnly, getUsers);

export default router;
