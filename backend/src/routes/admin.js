const express = require('express');
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// Apply auth middleware
router.use(verifyToken);

// Student Approval APIs (Accessible by Admin and Teacher)
router.get('/pending-students', authorizeRoles('admin', 'teacher'), adminController.getPendingStudents);
router.put('/approve-student/:id', authorizeRoles('admin', 'teacher'), adminController.approveStudent);
router.put('/reject-student/:id', authorizeRoles('admin', 'teacher'), adminController.rejectStudent);
router.put('/users/:id/approve', authorizeRoles('admin', 'teacher'), adminController.approveStudent);
router.put('/users/:id/reject', authorizeRoles('admin', 'teacher'), adminController.rejectStudent);

// Admin-only routes below
router.use(authorizeRoles('admin'));

// Dashboard APIs
router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);
router.get('/reports', adminController.getReports);
router.get('/system-logs', adminController.getSystemLogs);

// User Management APIs
router.route('/users')
    .get(adminController.getUsers);

router.route('/users/:id')
    .get(adminController.getUserById)
    .put(adminController.updateUser)
    .delete(adminController.deleteUser);

module.exports = router;
