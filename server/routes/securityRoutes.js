import express from 'express';
import {
  verifyPass,
  checkInVisitor,
  checkOutVisitor,
  getActiveVisitors,
  getExpectedVisitors,
  getVisitorHistory,
} from '../controllers/securityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('security', 'admin'));

router.post('/verify', verifyPass);
router.post('/check-in', checkInVisitor);
router.post('/check-out', checkOutVisitor);
router.get('/active-visitors', getActiveVisitors);
router.get('/expected-visitors', getExpectedVisitors);
router.get('/visitor-history', getVisitorHistory);

export default router;
