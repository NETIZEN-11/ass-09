import express from 'express';
import {
  generatePass,
  getPass,
  getPassByPassId,
  getPasses,
  revokePass,
  downloadPassPDF,
} from '../controllers/passController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate/:appointmentId', authorize('admin', 'employee'), generatePass);
router.get('/', authorize('admin', 'security'), getPasses);
router.get('/by-pass-id/:passId', getPassByPassId);
router.get('/:id', getPass);
router.get('/:id/pdf', downloadPassPDF);
router.patch('/:id/revoke', authorize('admin'), revokePass);

export default router;
