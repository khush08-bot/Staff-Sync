const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('hr'), createAnnouncement);
router.delete('/:id', authorize('hr'), deleteAnnouncement);

module.exports = router;
