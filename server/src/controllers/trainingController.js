const Training = require('../models/Training');
const Employee = require('../models/Employee');

// @desc    Get training programs
// @route   GET /api/training
// @access  Private (HR, Manager, Employee)
const getTrainingPrograms = async (req, res, next) => {
  try {
    let query = {};

    // For employees, retrieve trainings where they are assigned or open to All
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (employee) {
        query.$or = [
          { assignedEmployees: employee._id },
          { department: 'All' },
          { department: employee.department },
        ];
      }
    }

    const trainings = await Training.find(query)
      .populate('assignedEmployees', 'firstName lastName employeeId department designation email')
      .populate('createdBy', 'name email role')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      count: trainings.length,
      trainings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single training program
// @route   GET /api/training/:id
// @access  Private
const getTrainingById = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('assignedEmployees', 'firstName lastName employeeId department designation email')
      .populate('createdBy', 'name email');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    res.json({
      success: true,
      training,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a training program
// @route   POST /api/training
// @access  Private (Manager & HR)
const createTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructor,
      department = 'General',
      startDate,
      endDate,
      assignedEmployees = [],
      status = 'Upcoming',
    } = req.body;

    if (!title || !description || !instructor || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, instructor, start date, and end date are required.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    const training = await Training.create({
      title: title.trim(),
      description: description.trim(),
      instructor: instructor.trim(),
      department: department.trim(),
      startDate: start,
      endDate: end,
      assignedEmployees,
      status,
      createdBy: req.user._id,
    });

    const populated = await Training.findById(training._id)
      .populate('assignedEmployees', 'firstName lastName employeeId department')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Training program created successfully.',
      training: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a training program
// @route   PUT /api/training/:id
// @access  Private (Manager & HR)
const updateTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructor,
      department,
      startDate,
      endDate,
      assignedEmployees,
      status,
    } = req.body;

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    if (title) training.title = title.trim();
    if (description) training.description = description.trim();
    if (instructor) training.instructor = instructor.trim();
    if (department) training.department = department.trim();
    if (startDate) training.startDate = new Date(startDate);
    if (endDate) training.endDate = new Date(endDate);
    if (status) training.status = status;
    if (assignedEmployees !== undefined) training.assignedEmployees = assignedEmployees;

    if (training.endDate < training.startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    await training.save();

    const populated = await Training.findById(training._id)
      .populate('assignedEmployees', 'firstName lastName employeeId department')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Training program updated successfully.',
      training: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete training program
// @route   DELETE /api/training/:id
// @access  Private (Manager & HR)
const deleteTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found.',
      });
    }

    await Training.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Training program removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrainingPrograms,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
};
