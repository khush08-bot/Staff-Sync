const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user (Public registration ALWAYS creates Employee role only)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Enforce role: Public registration creates 'employee' accounts ONLY.
    // Privileged accounts (HR, Manager) are provisioned via database seed or HR management.
    const userRole = 'employee';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
    });

    // Split name into first and last
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Employee';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Generate readable employee ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const employeeId = `EMP-${randomSuffix}`;

    // Create linked Employee record
    const employee = await Employee.create({
      user: user._id,
      employeeId,
      firstName,
      lastName,
      email: user.email,
      phone: phone ? phone.trim() : '',
      department: department ? department.trim() : 'Operations',
      designation: designation ? designation.trim() : 'Associate',
      role: userRole,
      status: 'Active',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully as Employee.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Explicitly query with password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Fetch linked employee record
    const employee = await Employee.findOne({ user: user._id });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & employee details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const employee = await Employee.findOne({ user: user._id }).populate('manager', 'name email');

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update personal employee profile (phone, address, etc.)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { phone, address } = req.body;

    let employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found for this user.',
      });
    }

    if (phone !== undefined) employee.phone = phone.trim();
    if (address !== undefined) employee.address = address.trim();

    await employee.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
