const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(verifyToken);

router.get('/', authorizeRoles('student'), timelineController.getStudentTimeline);

module.exports = router;
