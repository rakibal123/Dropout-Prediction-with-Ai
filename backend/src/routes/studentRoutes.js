const express = require('express');
const studentController = require('../controllers/studentController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// All routes require student authentication
router.use(verifyToken, authorizeRoles('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.get('/predictions/latest', studentController.getLatestPrediction);
router.get('/behavior/latest', studentController.getLatestBehavior);

module.exports = router;
