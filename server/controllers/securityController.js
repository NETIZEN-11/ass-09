import Pass from '../models/Pass.js';
import CheckLog from '../models/CheckLog.js';
import Visitor from '../models/Visitor.js';
import Appointment from '../models/Appointment.js';
import { verifyQRData } from '../services/qrService.js';
import { sendArrivalNotification } from '../services/emailService.js';

// @desc    Verify pass (QR or Pass ID)
// @route   POST /api/security/verify
// @access  Private (Security)
export const verifyPass = async (req, res) => {
  try {
    const { qrData, passId } = req.body;
    let pass;

    if (qrData) {
      // Verify QR data
      const verification = verifyQRData(qrData);
      if (!verification.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code',
        });
      }
      pass = await Pass.findOne({ passId: verification.passId });
    } else if (passId) {
      pass = await Pass.findOne({ passId });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide QR data or Pass ID',
      });
    }

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found',
      });
    }

    // Populate pass details
    await pass.populate('visitorId', 'fullName email phone company photograph isBlacklisted');
    await pass.populate({
      path: 'appointmentId',
      populate: { path: 'hostId', select: 'name email department' }
    });

    // Check if visitor is blacklisted
    if (pass.visitorId.isBlacklisted) {
      return res.status(403).json({
        success: false,
        message: 'Visitor is blacklisted',
        data: pass,
      });
    }

    // Check pass status
    if (pass.status === 'revoked') {
      return res.status(403).json({
        success: false,
        message: 'Pass has been revoked',
        data: pass,
      });
    }

    if (pass.status === 'expired') {
      return res.status(403).json({
        success: false,
        message: 'Pass has expired',
        data: pass,
      });
    }

    // Check validity dates
    const now = new Date();
    if (now < pass.validFrom || now > pass.validUntil) {
      pass.status = 'expired';
      await pass.save();
      return res.status(403).json({
        success: false,
        message: 'Pass is not valid for current date/time',
        data: pass,
      });
    }

    // Check if visitor is already checked in
    const activeCheckIn = await CheckLog.findOne({
      visitorId: pass.visitorId._id,
      entryStatus: 'checked-in',
      checkOutTime: null,
    });

    res.status(200).json({
      success: true,
      message: 'Pass verified successfully',
      data: {
        pass,
        isAlreadyCheckedIn: !!activeCheckIn,
        activeCheckIn,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check-in visitor
// @route   POST /api/security/check-in
// @access  Private (Security)
export const checkInVisitor = async (req, res) => {
  try {
    const { passId, notes, temperature, itemsCarried } = req.body;

    const pass = await Pass.findOne({ passId })
      .populate('visitorId', 'fullName email visitCount')
      .populate({
        path: 'appointmentId',
        populate: { path: 'hostId', select: 'name email' }
      });

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found',
      });
    }

    // Check if already checked in
    const activeCheckIn = await CheckLog.findOne({
      visitorId: pass.visitorId._id,
      entryStatus: 'checked-in',
      checkOutTime: null,
    });

    if (activeCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Visitor is already checked in',
      });
    }

    // Create check-in log
    const checkLog = await CheckLog.create({
      visitorId: pass.visitorId._id,
      passId: pass._id,
      securityUserId: req.user.id,
      checkInTime: new Date(),
      entryStatus: 'checked-in',
      organizationId: req.user.organizationId,
      notes,
      temperature,
      itemsCarried,
    });

    // Update pass status
    pass.status = 'used';
    await pass.save();

    // Update visitor visit count
    pass.visitorId.visitCount += 1;
    await pass.visitorId.save();

    // Send arrival notification to host
    if (pass.appointmentId && pass.appointmentId.hostId) {
      await sendArrivalNotification(
        pass.appointmentId.hostId.email,
        pass.appointmentId.hostId.name,
        pass.visitorId.fullName,
        checkLog.checkInTime
      );
    }

    await checkLog.populate('visitorId', 'fullName email phone company photograph');

    res.status(201).json({
      success: true,
      message: 'Visitor checked in successfully',
      data: checkLog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check-out visitor
// @route   POST /api/security/check-out
// @access  Private (Security)
export const checkOutVisitor = async (req, res) => {
  try {
    const { passId, checkLogId } = req.body;
    let checkLog;

    if (checkLogId) {
      checkLog = await CheckLog.findById(checkLogId);
    } else if (passId) {
      const pass = await Pass.findOne({ passId });
      if (!pass) {
        return res.status(404).json({
          success: false,
          message: 'Pass not found',
        });
      }
      checkLog = await CheckLog.findOne({
        passId: pass._id,
        entryStatus: 'checked-in',
        checkOutTime: null,
      });
    }

    if (!checkLog) {
      return res.status(404).json({
        success: false,
        message: 'Active check-in not found',
      });
    }

    if (checkLog.entryStatus === 'checked-out') {
      return res.status(400).json({
        success: false,
        message: 'Visitor is already checked out',
      });
    }

    checkLog.checkOutTime = new Date();
    checkLog.entryStatus = 'checked-out';
    await checkLog.save();

    // Update appointment status to completed
    const pass = await Pass.findById(checkLog.passId);
    if (pass) {
      await Appointment.findByIdAndUpdate(pass.appointmentId, { status: 'completed' });
    }

    await checkLog.populate('visitorId', 'fullName email phone company photograph');

    res.status(200).json({
      success: true,
      message: 'Visitor checked out successfully',
      data: checkLog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get active visitors (currently inside)
// @route   GET /api/security/active-visitors
// @access  Private (Security, Admin)
export const getActiveVisitors = async (req, res) => {
  try {
    const activeCheckIns = await CheckLog.find({
      organizationId: req.user.organizationId,
      entryStatus: 'checked-in',
      checkOutTime: null,
    })
      .populate('visitorId', 'fullName email phone company photograph')
      .populate('securityUserId', 'name')
      .sort({ checkInTime: -1 });

    res.status(200).json({
      success: true,
      data: activeCheckIns,
      count: activeCheckIns.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get today's expected visitors
// @route   GET /api/security/expected-visitors
// @access  Private (Security)
export const getExpectedVisitors = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      organizationId: req.user.organizationId,
      status: 'approved',
      visitDate: { $gte: today, $lt: tomorrow },
    })
      .populate('visitorId', 'fullName email phone company photograph')
      .populate('hostId', 'name department')
      .sort({ arrivalTime: 1 });

    // Get passes for these appointments
    const appointmentIds = appointments.map(app => app._id);
    const passes = await Pass.find({ appointmentId: { $in: appointmentIds } });
    const passMap = {};
    passes.forEach(pass => {
      passMap[pass.appointmentId.toString()] = pass;
    });

    // Add pass info to appointments
    const result = appointments.map(app => ({
      ...app.toObject(),
      pass: passMap[app._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get visitor history
// @route   GET /api/security/visitor-history
// @access  Private (Security, Admin)
export const getVisitorHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { organizationId: req.user.organizationId };

    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) {
        query.checkInTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.checkInTime.$lte = new Date(endDate);
      }
    }

    const logs = await CheckLog.find(query)
      .populate('visitorId', 'fullName email phone company')
      .populate('securityUserId', 'name')
      .sort({ checkInTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await CheckLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
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
