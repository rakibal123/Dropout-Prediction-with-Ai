const express = require('express');
const studentController = require('../controllers/studentController');
const behaviorController = require('../controllers/behaviorController');
const predictionController = require('../controllers/predictionController');
const predictionHistoryController = require('../controllers/predictionHistoryController');
const { behaviorValidator } = require('../validators/behaviorValidator');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// All routes require student authentication
router.use(verifyToken, authorizeRoles('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.get('/predictions/latest', studentController.getLatestPrediction);
router.get('/predictions', predictionHistoryController.getPredictionHistory);
router.get('/behavior/latest', studentController.getLatestBehavior);

router.post('/behavior', behaviorValidator, behaviorController.submitBehavior);
router.post('/predict', predictionController.predict);
router.post('/predict-preview', predictionController.predictPreview);

// Academic Data Routes
const academicStudentController = require('../controllers/academicStudentController');
router.get('/current-semester', academicStudentController.getCurrentSemester);
router.put('/current-semester', academicStudentController.updateCurrentSemester);
router.get('/semesters', academicStudentController.getAllSemesters);
router.get('/courses', academicStudentController.getMyCourses);
router.get('/courses/:courseId', academicStudentController.getCourseDetails);
router.get('/semester-history', academicStudentController.getSemesterHistory);

module.exports = router;
