import express from 'express';
import {
  getTokens,
  getTokenById,
  createToken,
  updateToken,
  deleteToken,
  getDashboardAnalytics,
} from '../controllers/tokenController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT verification middleware to all endpoints
router.use(protect);

// Dashboard analytics endpoint (must stand before parameter router)
router.get('/analytics', getDashboardAnalytics);

router.route('/')
  .get(getTokens)
  .post(createToken);

router.route('/:id')
  .get(getTokenById)
  .put(updateToken)
  .delete(deleteToken);

export default router;
