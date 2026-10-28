const Announcement = require('../models/Announcement');

// @desc    Get announcements filtered by user role visibility
// @route   GET /api/announcements
// @access  Private (All authenticated roles)
const getAnnouncements = async (req, res, next) => {
  try {
    let query = {};

    // HR can view all announcements; Manager and Employee see 'All' or their specific role
    if (req.user.role !== 'hr') {
      query.targetAudience = { $in: ['All', req.user.role] };
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (HR only)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, priority = 'Medium', targetAudience = 'All' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required.',
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      priority,
      targetAudience,
      author: req.user._id,
      authorName: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR only)
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
