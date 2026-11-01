import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  photograph: {
    type: String,
    default: null,
  },
  purpose: {
    type: String,
    required: [true, 'Purpose of visit is required'],
  },
  identityType: {
    type: String,
    enum: ['Aadhar Card', 'PAN Card', 'Driving License', 'Passport', 'Voter ID', 'Other'],
    default: 'Aadhar Card',
  },
  identityNumber: {
    type: String,
    trim: true,
  },
  organizationId: {
    type: String,
    required: true,
    default: 'demo-org-001',
  },
  isBlacklisted: {
    type: Boolean,
    default: false,
  },
  blacklistReason: {
    type: String,
  },
  visitCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for faster searches
visitorSchema.index({ email: 1, organizationId: 1 });
visitorSchema.index({ phone: 1 });
visitorSchema.index({ fullName: 'text' });

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
