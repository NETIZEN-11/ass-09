import mongoose from 'mongoose';

const passSchema = new mongoose.Schema({
  passId: {
    type: String,
    required: true,
    unique: true,
  },
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  pdfPath: {
    type: String,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'revoked'],
    default: 'active',
  },
  organizationId: {
    type: String,
    required: true,
    default: 'demo-org-001',
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  revokedAt: {
    type: Date,
  },
  revocationReason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for QR code verification
passSchema.index({ passId: 1, status: 1 });
passSchema.index({ qrCode: 1 });
passSchema.index({ validFrom: 1, validUntil: 1 });

const Pass = mongoose.model('Pass', passSchema);

export default Pass;
