import express from 'express';
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMenu)
  .post(adminOnly, createMenuItem);

router.route('/:id')
  .put(adminOnly, updateMenuItem)
  .delete(adminOnly, deleteMenuItem);

export default router;
