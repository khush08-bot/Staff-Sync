const express = require('express');
const router = express.Router();
const {
  getTrainingPrograms,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
} = require('../controllers/trainingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getTrainingPrograms);
router.get('/:id', getTrainingById);
router.post('/', authorize('manager', 'hr'), createTraining);
router.put('/:id', authorize('manager', 'hr'), updateTraining);
router.delete('/:id', authorize('manager', 'hr'), deleteTraining);

module.exports = router;
