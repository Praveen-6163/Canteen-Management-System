import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCategories)
  .post(adminOnly, createCategory);

router.route('/:id')
  .put(adminOnly, updateCategory)
  .delete(adminOnly, deleteCategory);

export default router;
