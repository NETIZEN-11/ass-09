import express from 'express';
import {
  getDashboardStats,
  getDashboardAnalytics,
  getRecentVisitors,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/analytics', authorize('admin', 'security'), getDashboardAnalytics);
router.get('/recent-visitors', getRecentVisitors);

export default router;
