import mongoose from 'mongoose';

const checkLogSchema = new mongoose.Schema({
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true,
  },
  passId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pass',
    required: true,
  },
  securityUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  checkInTime: {
    type: Date,
    required: true,
  },
  checkOutTime: {
    type: Date,
  },
  entryStatus: {
    type: String,
    enum: ['checked-in', 'checked-out'],
    default: 'checked-in',
  },
  organizationId: {
    type: String,
    required: true,
    default: 'demo-org-001',
  },
  notes: {
    type: String,
  },
  temperature: {
    type: String,
  },
  itemsCarried: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
checkLogSchema.index({ checkInTime: 1 });
checkLogSchema.index({ visitorId: 1, entryStatus: 1 });
checkLogSchema.index({ organizationId: 1 });

const CheckLog = mongoose.model('CheckLog', checkLogSchema);

export default CheckLog;
