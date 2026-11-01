import Visitor from '../models/Visitor.js';

// @desc    Create visitor
// @route   POST /api/visitors
// @access  Public/Private
export const createVisitor = async (req, res) => {
  try {
    const { fullName, email, phone, company, purpose, identityType, identityNumber, organizationId } = req.body;

    // Check if visitor already exists
    let visitor = await Visitor.findOne({ email, organizationId: organizationId || process.env.DEFAULT_ORG_ID });

    if (visitor) {
      // Update existing visitor
      visitor.fullName = fullName;
      visitor.phone = phone;
      visitor.company = company;
      visitor.purpose = purpose;
      visitor.identityType = identityType;
      visitor.identityNumber = identityNumber;
      
      if (req.file) {
        visitor.photograph = `/uploads/${req.file.filename}`;
      }

      await visitor.save();
    } else {
      // Create new visitor
      const visitorData = {
        fullName,
        email,
        phone,
        company,
        purpose,
        identityType,
        identityNumber,
        organizationId: organizationId || process.env.DEFAULT_ORG_ID,
      };

      if (req.file) {
        visitorData.photograph = `/uploads/${req.file.filename}`;
      }

      visitor = await Visitor.create(visitorData);
    }

    res.status(201).json({
      success: true,
      message: 'Visitor registered successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all visitors
// @route   GET /api/visitors
// @access  Private (Admin, Security)
export const getVisitors = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, organizationId } = req.query;
    const query = { organizationId: organizationId || req.user.organizationId };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const visitors = await Visitor.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Visitor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: visitors,
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

// @desc    Get single visitor
// @route   GET /api/visitors/:id
// @access  Private
export const getVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update visitor
// @route   PUT /api/visitors/:id
// @access  Private (Admin)
export const updateVisitor = async (req, res) => {
  try {
    let visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    if (req.file) {
      req.body.photograph = `/uploads/${req.file.filename}`;
    }

    visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Visitor updated successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete visitor
// @route   DELETE /api/visitors/:id
// @access  Private (Admin)
export const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    await visitor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Visitor deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Blacklist visitor
// @route   PATCH /api/visitors/:id/blacklist
// @access  Private (Admin)
export const blacklistVisitor = async (req, res) => {
  try {
    const { reason } = req.body;
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }

    visitor.isBlacklisted = true;
    visitor.blacklistReason = reason;
    await visitor.save();

    res.status(200).json({
      success: true,
      message: 'Visitor blacklisted successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
