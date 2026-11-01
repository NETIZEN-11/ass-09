import express from 'express';
import {
  createVisitor,
  getVisitors,
  getVisitor,
  updateVisitor,
  deleteVisitor,
  blacklistVisitor,
} from '../controllers/visitorController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('photograph'), createVisitor);
router.get('/', protect, authorize('admin', 'security'), getVisitors);
router.get('/:id', protect, getVisitor);
router.put('/:id', protect, authorize('admin'), upload.single('photograph'), updateVisitor);
router.delete('/:id', protect, authorize('admin'), deleteVisitor);
router.patch('/:id/blacklist', protect, authorize('admin'), blacklistVisitor);

export default router;
