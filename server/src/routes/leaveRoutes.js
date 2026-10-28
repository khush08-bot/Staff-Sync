const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getLeavesForReview,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/', authorize('hr', 'manager'), getLeavesForReview);
router.put('/:id/status', authorize('hr', 'manager'), updateLeaveStatus);

module.exports = router;
