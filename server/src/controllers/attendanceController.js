const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Helper to get formatted date YYYY-MM-DD
const getTodayDateString = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// @desc    Check-in for today
// @route   POST /api/attendance/check-in
// @access  Private (Employee, Manager, HR)
const checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found for this user account.',
      });
    }

    const todayDate = getTodayDateString();

    // Check if already checked in today
    const existing = await Attendance.findOne({
      employee: employee._id,
      date: todayDate,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You have already checked in today (${todayDate}) at ${new Date(existing.checkIn).toLocaleTimeString()}.`,
        attendance: existing,
      });
    }

    const now = new Date();
    // Simple logic: if checked in after 09:30 AM local/server time, flag as Late
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);

    const attendance = await Attendance.create({
      employee: employee._id,
      user: req.user._id,
      date: todayDate,
      checkIn: now,
      status: isLate ? 'Late' : 'Present',
      notes: req.body.notes || '',
    });

    res.status(201).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}. Status: ${attendance.status}`,
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today.',
      });
    }
    next(error);
  }
};

// @desc    Check-out for today
// @route   POST /api/attendance/check-out
// @access  Private (Employee, Manager, HR)
const checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found for this user.',
      });
    }

    const todayDate = getTodayDateString();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: todayDate,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. You must check in before checking out.',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: `You have already checked out today at ${new Date(attendance.checkOut).toLocaleTimeString()}.`,
        attendance,
      });
    }

    const now = new Date();
    const durationMs = now.getTime() - new Date(attendance.checkIn).getTime();
    const workHours = Math.max(0.1, Number((durationMs / (1000 * 60 * 60)).toFixed(2)));

    attendance.checkOut = now;
    attendance.workHours = workHours;

    // If worked less than 4 hours, mark as Half Day
    if (workHours < 4) {
      attendance.status = 'Half Day';
    }

    if (req.body.notes) {
      attendance.notes = (attendance.notes ? attendance.notes + ' | ' : '') + req.body.notes;
    }

    await attendance.save();

    res.json({
      success: true,
      message: `Checked out successfully at ${now.toLocaleTimeString()}. Total hours: ${workHours} hrs.`,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's today attendance status
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.json({
        success: true,
        attendance: null,
      });
    }

    const todayDate = getTodayDateString();
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: todayDate,
    });

    res.json({
      success: true,
      todayDate,
      attendance: attendance || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personal attendance history
// @route   GET /api/attendance/my-history
// @access  Private
const getMyAttendanceHistory = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.json({
        success: true,
        history: [],
      });
    }

    const history = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 })
      .limit(60);

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records (HR overview)
// @route   GET /api/attendance
// @access  Private (HR only)
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, department, status } = req.query;
    let query = {};

    if (date) {
      query.date = date;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    let records = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeId department designation email',
      })
      .sort({ date: -1, checkIn: -1 });

    if (department && department !== 'All') {
      records = records.filter(
        (rec) => rec.employee && rec.employee.department === department
      );
    }

    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getAllAttendance,
};
