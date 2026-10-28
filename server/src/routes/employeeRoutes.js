const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getManagersList,
  getMyTeam,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Specific routes first
router.get('/meta/managers', authorize('hr', 'manager'), getManagersList);
router.get('/team/me', authorize('manager'), getMyTeam);

// General employee collection routes
router.get('/', authorize('hr', 'manager'), getEmployees);
router.post('/', authorize('hr'), createEmployee);

// Individual employee routes
router.get('/:id', getEmployeeById);
router.put('/:id', authorize('hr'), updateEmployee);
router.delete('/:id', authorize('hr'), deleteEmployee);

module.exports = router;
