const User = require('../models/User');
const Employee = require('../models/Employee');

// @desc    Get all employees with search and filters
// @route   GET /api/employees
// @access  Private (HR & Manager)
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, role, status } = req.query;
    let query = {};

    // If manager, they can view their assigned team members unless searching general for training
    if (req.user.role === 'manager' && req.query.teamOnly === 'true') {
      query.manager = req.user._id;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { employeeId: regex },
        { designation: regex },
      ];
    }

    const employees = await Employee.find(query)
      .populate('manager', 'name email role')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private (HR, Manager for team, Employee for self)
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('user', 'name email role');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    // Authorization check
    if (req.user.role === 'employee' && employee.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to view your own profile.',
      });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee and linked user account
// @route   POST /api/employees
// @access  Private (HR only)
const createEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      department,
      designation,
      role = 'employee',
      joiningDate,
      manager,
      status = 'Active',
      address,
    } = req.body;

    if (!firstName || !lastName || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, department, and designation are required.',
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const existingEmp = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existingEmp) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists.',
      });
    }

    const initialPassword = password || 'StaffSync@2026';

    // Create user account
    const user = await User.create({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.toLowerCase().trim(),
      password: initialPassword,
      role: ['hr', 'manager', 'employee'].includes(role) ? role : 'employee',
    });

    // Generate unique employee ID
    const count = await Employee.countDocuments();
    const employeeId = `EMP-${String(count + 101).padStart(4, '0')}`;

    // Create employee record
    const employee = await Employee.create({
      user: user._id,
      employeeId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: user.email,
      phone: phone ? phone.trim() : '',
      department: department.trim(),
      designation: designation.trim(),
      role: user.role,
      joiningDate: joiningDate || Date.now(),
      manager: manager || null,
      status,
      address: address ? address.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Employee and user account created successfully.',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (HR only)
const updateEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      department,
      designation,
      role,
      manager,
      status,
      address,
      joiningDate,
    } = req.body;

    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    if (firstName) employee.firstName = firstName.trim();
    if (lastName) employee.lastName = lastName.trim();
    if (phone !== undefined) employee.phone = phone.trim();
    if (department) employee.department = department.trim();
    if (designation) employee.designation = designation.trim();
    if (address !== undefined) employee.address = address.trim();
    if (joiningDate) employee.joiningDate = joiningDate;
    if (status) employee.status = status;
    if (manager !== undefined) employee.manager = manager || null;

    if (role && ['hr', 'manager', 'employee'].includes(role)) {
      employee.role = role;
      // Sync user role
      await User.findByIdAndUpdate(employee.user, {
        role,
        name: `${employee.firstName} ${employee.lastName}`,
      });
    }

    await employee.save();

    const updated = await Employee.findById(employee._id)
      .populate('manager', 'name email')
      .populate('user', 'name email role');

    res.json({
      success: true,
      message: 'Employee updated successfully.',
      employee: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee & linked user
// @route   DELETE /api/employees/:id
// @access  Private (HR only)
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    // Remove user account as well
    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
    }

    await Employee.findByIdAndDelete(employee._id);

    res.json({
      success: true,
      message: 'Employee and user account removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of managers (for dropdown assignment)
// @route   GET /api/employees/meta/managers
// @access  Private (HR & Manager)
const getManagersList = async (req, res, next) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('name email role');
    res.json({
      success: true,
      managers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team members for the logged-in Manager
// @route   GET /api/employees/team/me
// @access  Private (Manager only)
const getMyTeam = async (req, res, next) => {
  try {
    const team = await Employee.find({ manager: req.user._id })
      .populate('user', 'name email')
      .sort({ firstName: 1 });

    res.json({
      success: true,
      count: team.length,
      team,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getManagersList,
  getMyTeam,
};
