import Visitor from '../models/Visitor.js';
import Appointment from '../models/Appointment.js';
import Pass from '../models/Pass.js';
import CheckLog from '../models/CheckLog.js';
import User from '../models/User.js';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Total visitors
    const totalVisitors = await Visitor.countDocuments({ organizationId: orgId });

    // Today's visitors
    const todayVisitors = await CheckLog.countDocuments({
      organizationId: orgId,
      checkInTime: { $gte: todayStart, $lte: todayEnd },
    });

    // Currently inside
    const currentlyInside = await CheckLog.countDocuments({
      organizationId: orgId,
      entryStatus: 'checked-in',
      checkOutTime: null,
    });

    // Pending approvals
    const pendingApprovals = await Appointment.countDocuments({
      organizationId: orgId,
      status: 'pending',
    });

    // Completed visits
    const completedVisits = await Appointment.countDocuments({
      organizationId: orgId,
      status: 'completed',
    });

    // Active passes
    const activePasses = await Pass.countDocuments({
      organizationId: orgId,
      status: 'active',
    });

    // Total appointments
    const totalAppointments = await Appointment.countDocuments({
      organizationId: orgId,
    });

    // Total staff (if admin)
    let totalStaff = 0;
    if (req.user.role === 'admin') {
      totalStaff = await User.countDocuments({
        organizationId: orgId,
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalVisitors,
        todayVisitors,
        currentlyInside,
        pendingApprovals,
        completedVisits,
        activePasses,
        totalAppointments,
        totalStaff,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/dashboard/analytics
// @access  Private (Admin, Security)
export const getDashboardAnalytics = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const today = new Date();

    // Weekly visitor trend (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const count = await CheckLog.countDocuments({
        organizationId: orgId,
        checkInTime: { $gte: dayStart, $lte: dayEnd },
      });

      weeklyData.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        visitors: count,
      });
    }

    // Monthly visitor trend (last 30 days)
    const monthlyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const count = await CheckLog.countDocuments({
        organizationId: orgId,
        checkInTime: { $gte: dayStart, $lte: dayEnd },
      });

      monthlyData.push({
        date: date.toISOString().split('T')[0],
        visitors: count,
      });
    }

    // Visitors by department
    const departmentStats = await Appointment.aggregate([
      { $match: { organizationId: orgId, status: { $in: ['approved', 'completed'] } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const visitorsByDepartment = departmentStats.map(stat => ({
      department: stat._id || 'Unknown',
      count: stat.count,
    }));

    // Appointment status distribution
    const appointmentStats = await Appointment.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const appointmentsByStatus = appointmentStats.map(stat => ({
      status: stat._id,
      count: stat.count,
    }));

    // Recent activity
    const recentActivity = await CheckLog.find({ organizationId: orgId })
      .populate('visitorId', 'fullName company')
      .sort({ checkInTime: -1 })
      .limit(10)
      .select('visitorId checkInTime checkOutTime entryStatus');

    // Peak hours (hourly check-in distribution)
    const hourlyStats = await CheckLog.aggregate([
      { $match: { organizationId: orgId } },
      {
        $group: {
          _id: { $hour: '$checkInTime' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const peakHours = hourlyStats.map(stat => ({
      hour: `${stat._id}:00`,
      visitors: stat.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        weeklyTrend: weeklyData,
        monthlyTrend: monthlyData,
        visitorsByDepartment,
        appointmentsByStatus,
        recentActivity,
        peakHours,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get recent visitors
// @route   GET /api/dashboard/recent-visitors
// @access  Private
export const getRecentVisitors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentCheckIns = await CheckLog.find({
      organizationId: req.user.organizationId,
    })
      .populate('visitorId', 'fullName email phone company photograph')
      .sort({ checkInTime: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: recentCheckIns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
