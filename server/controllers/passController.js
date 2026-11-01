import Pass from '../models/Pass.js';
import Appointment from '../models/Appointment.js';
import Visitor from '../models/Visitor.js';
import User from '../models/User.js';
import generatePassId from '../utils/generatePassId.js';
import { generateQRCode } from '../services/qrService.js';
import { generateVisitorPassPDF } from '../services/pdfService.js';
import { sendPassGeneratedEmail } from '../services/emailService.js';
import { addDays } from 'date-fns';

// @desc    Generate pass for approved appointment
// @route   POST /api/passes/generate/:appointmentId
// @access  Private (Admin, Host)
export const generatePass = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('visitorId')
      .populate('hostId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only generate pass for approved appointments',
      });
    }

    // Check if pass already exists
    const existingPass = await Pass.findOne({ appointmentId: appointment._id, status: { $ne: 'revoked' } });
    if (existingPass) {
      return res.status(400).json({
        success: false,
        message: 'Pass already exists for this appointment',
        data: existingPass,
      });
    }

    // Generate pass ID
    const passId = generatePassId();

    // Generate QR code
    const qrData = JSON.stringify({
      passId,
      visitorId: appointment.visitorId._id,
      appointmentId: appointment._id,
    });
    const qrCode = await generateQRCode(qrData);

    // Set validity
    const validFrom = new Date(appointment.visitDate);
    validFrom.setHours(0, 0, 0, 0);
    const validUntil = addDays(validFrom, 1);
    validUntil.setHours(23, 59, 59, 999);

    // Create pass
    const pass = await Pass.create({
      passId,
      visitorId: appointment.visitorId._id,
      appointmentId: appointment._id,
      qrCode,
      validFrom,
      validUntil,
      status: 'active',
      organizationId: appointment.organizationId,
      generatedBy: req.user.id,
    });

    // Generate PDF
    try {
      const pdfPath = await generateVisitorPassPDF(pass, appointment.visitorId, appointment, appointment.hostId);
      pass.pdfPath = pdfPath;
      await pass.save();
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
    }

    // Send email notification
    await sendPassGeneratedEmail(
      appointment.visitorId.email,
      appointment.visitorId.fullName,
      passId
    );

    const populatedPass = await Pass.findById(pass._id)
      .populate('visitorId', 'fullName email phone company photograph')
      .populate('appointmentId')
      .populate({
        path: 'appointmentId',
        populate: { path: 'hostId', select: 'name email department' }
      });

    res.status(201).json({
      success: true,
      message: 'Pass generated successfully',
      data: populatedPass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get pass by ID
// @route   GET /api/passes/:id
// @access  Private
export const getPass = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('visitorId', 'fullName email phone company photograph')
      .populate({
        path: 'appointmentId',
        populate: { path: 'hostId', select: 'name email department' }
      });

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get pass by pass ID
// @route   GET /api/passes/by-pass-id/:passId
// @access  Private
export const getPassByPassId = async (req, res) => {
  try {
    const pass = await Pass.findOne({ passId: req.params.passId })
      .populate('visitorId', 'fullName email phone company photograph')
      .populate({
        path: 'appointmentId',
        populate: { path: 'hostId', select: 'name email department' }
      });

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all passes
// @route   GET /api/passes
// @access  Private (Admin, Security)
export const getPasses = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { organizationId: req.user.organizationId };

    if (status) {
      query.status = status;
    }

    const passes = await Pass.find(query)
      .populate('visitorId', 'fullName email phone')
      .populate({
        path: 'appointmentId',
        populate: { path: 'hostId', select: 'name department' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Pass.countDocuments(query);

    res.status(200).json({
      success: true,
      data: passes,
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

// @desc    Revoke pass
// @route   PATCH /api/passes/:id/revoke
// @access  Private (Admin)
export const revokePass = async (req, res) => {
  try {
    const { reason } = req.body;
    const pass = await Pass.findById(req.params.id);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found',
      });
    }

    pass.status = 'revoked';
    pass.revokedBy = req.user.id;
    pass.revokedAt = new Date();
    pass.revocationReason = reason;
    await pass.save();

    res.status(200).json({
      success: true,
      message: 'Pass revoked successfully',
      data: pass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Download pass PDF
// @route   GET /api/passes/:id/pdf
// @access  Private
export const downloadPassPDF = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found',
      });
    }

    if (!pass.pdfPath) {
      return res.status(404).json({
        success: false,
        message: 'PDF not available for this pass',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        pdfUrl: `${process.env.SERVER_URL}/public${pass.pdfPath}`,
        pdfPath: pass.pdfPath,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
