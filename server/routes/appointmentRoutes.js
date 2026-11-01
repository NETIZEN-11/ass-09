import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointment,
  approveAppointment,
  rejectAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createAppointment);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointment);
router.patch('/:id/approve', protect, authorize('admin', 'employee'), approveAppointment);
router.patch('/:id/reject', protect, authorize('admin', 'employee'), rejectAppointment);
router.put('/:id', protect, authorize('admin', 'employee'), updateAppointment);
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

export default router;
