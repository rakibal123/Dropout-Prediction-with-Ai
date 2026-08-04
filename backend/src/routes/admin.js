const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getPendingStudents, approveStudent, rejectStudent } = require('../controllers/adminController');

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);

// Apply role restriction to all routes in this file
router.use(restrictTo('admin', 'teacher'));

// Routes
router.route('/pending-students').get(getPendingStudents);
router.route('/approve-student/:id').put(approveStudent);
router.route('/reject-student/:id').put(rejectStudent);

module.exports = router;
