import Appointment from '../models/Appointment.js';
import Visitor from '../models/Visitor.js';
import User from '../models/User.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Employee) or Public (Visitor)
export const createAppointment = async (req, res) => {
  try {
    const { visitorId, hostId, department, visitDate, arrivalTime, purpose, notes, organizationId } = req.body;

    // Verify visitor exists
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    // Check if visitor is blacklisted
    if (visitor.isBlacklisted) {
      return res.status(403).json({
        success: false,
        message: 'This visitor is blacklisted and cannot make appointments',
      });
    }

    // Verify host exists
    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host not found',
      });
    }

    const appointment = await Appointment.create({
      visitorId,
      hostId,
      department,
      visitDate,
      arrivalTime,
      purpose,
      notes,
      organizationId: organizationId || req.user?.organizationId || process.env.DEFAULT_ORG_ID,
      status: 'pending',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('visitorId', 'fullName email phone company')
      .populate('hostId', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    const { status, hostId, date, page = 1, limit = 10 } = req.query;
    const query = { organizationId: req.user.organizationId };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by host (for employees to see their appointments)
    if (hostId) {
      query.hostId = hostId;
    } else if (req.user.role === 'employee') {
      query.hostId = req.user.id;
    }

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.visitDate = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('visitorId', 'fullName email phone company photograph')
      .populate('hostId', 'name email department')
      .sort({ visitDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitorId', 'fullName email phone company photograph purpose identityType')
      .populate('hostId', 'name email department phone')
      .populate('approvedBy', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve appointment
// @route   PATCH /api/appointments/:id/approve
// @access  Private (Host/Admin)
export const approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitorId', 'fullName email')
      .populate('hostId', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user is authorized to approve
    if (req.user.role !== 'admin' && appointment.hostId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this appointment',
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve appointment with status: ${appointment.status}`,
      });
    }

    appointment.status = 'approved';
    appointment.approvalDate = new Date();
    appointment.approvedBy = req.user.id;
    await appointment.save();

    // Send approval email
    await sendApprovalEmail(
      appointment.visitorId.email,
      appointment.visitorId.fullName,
      appointment.hostId.name,
      appointment.visitDate
    );

    res.status(200).json({
      success: true,
      message: 'Appointment approved successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject appointment
// @route   PATCH /api/appointments/:id/reject
// @access  Private (Host/Admin)
export const rejectAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitorId', 'fullName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user is authorized to reject
    if (req.user.role !== 'admin' && appointment.hostId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this appointment',
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject appointment with status: ${appointment.status}`,
      });
    }

    appointment.status = 'rejected';
    appointment.rejectionReason = reason;
    appointment.approvedBy = req.user.id;
    await appointment.save();

    // Send rejection email
    await sendRejectionEmail(
      appointment.visitorId.email,
      appointment.visitorId.fullName,
      reason
    );

    res.status(200).json({
      success: true,
      message: 'Appointment rejected',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin)
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
