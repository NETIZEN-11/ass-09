import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  visitDate: {
    type: Date,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  approvalDate: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
  },
  organizationId: {
    type: String,
    required: true,
    default: 'demo-org-001',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
appointmentSchema.index({ visitDate: 1, status: 1 });
appointmentSchema.index({ hostId: 1, status: 1 });
appointmentSchema.index({ organizationId: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
