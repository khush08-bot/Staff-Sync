const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// Helper to calculate days between dates (inclusive)
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private (Employee, Manager, HR)
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, and reason are required.',
      });
    }

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found for this user account.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided.',
      });
    }

    // Prevent end date before start date
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    const days = calculateLeaveDays(startDate, endDate);
    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Leave duration must be at least 1 day.',
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      days,
      reason: reason.trim(),
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's personal leave requests
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.json({
        success: true,
        leaves: [],
      });
    }

    const leaves = await Leave.find({ employee: employee._id })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave requests for review (HR gets all, Manager gets team requests)
// @route   GET /api/leaves
// @access  Private (HR & Manager)
const getLeavesForReview = async (req, res, next) => {
  try {
    const { status, leaveType } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'All') {
      query.leaveType = leaveType;
    }

    // If Manager: only fetch leave requests from employees where manager == req.user._id
    if (req.user.role === 'manager') {
      const teamEmployees = await Employee.find({ manager: req.user._id }).select('_id');
      const teamEmployeeIds = teamEmployees.map((e) => e._id);
      query.employee = { $in: teamEmployeeIds };
    }

    const leaves = await Leave.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeId department designation email manager',
      })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private (HR & Manager)
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, reviewRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Approved" or "Rejected".',
      });
    }

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    // Only pending requests may be processed
    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This leave request has already been ${leave.status.toLowerCase()} by ${leave.reviewerName || 'a reviewer'}.`,
      });
    }

    // Manager authorization check: must oversee this employee
    if (req.user.role === 'manager') {
      if (
        !leave.employee ||
        !leave.employee.manager ||
        leave.employee.manager.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only review leave requests from your assigned team members.',
        });
      }
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewerName = req.user.name;
    leave.reviewRemarks = reviewRemarks ? reviewRemarks.trim() : '';
    leave.reviewedAt = new Date();

    await leave.save();

    // If leave approved and ongoing today, update employee status if desired
    if (status === 'Approved') {
      const now = new Date();
      if (now >= leave.startDate && now <= leave.endDate) {
        await Employee.findByIdAndUpdate(leave.employee._id, { status: 'On Leave' });
      }
    }

    res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()} successfully.`,
      leave,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getLeavesForReview,
  updateLeaveStatus,
};
