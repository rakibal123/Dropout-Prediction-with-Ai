const express = require('express');
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// Apply auth and role middleware
router.use(verifyToken, authorizeRoles('admin'));

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

// Legacy/Explicit Student Approval APIs (if needed by frontend directly)
router.put('/users/:id/approve', adminController.approveStudent);
router.put('/users/:id/reject', adminController.rejectStudent);

module.exports = router;
