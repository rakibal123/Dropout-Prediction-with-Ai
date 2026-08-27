const express = require('express');
const teacherAcademicController = require('../controllers/teacherAcademicController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

router.use(verifyToken, authorizeRoles('teacher'));

router.get('/my-courses', teacherAcademicController.getMyTeachingCourses);
router.get('/courses/:courseId/students', teacherAcademicController.getCourseStudents);
router.get('/courses/:courseId/template', teacherAcademicController.downloadExcelTemplate);
router.post('/courses/:courseId/upload', teacherAcademicController.uploadCourseData);
router.post('/courses/:courseId/manual-upload', teacherAcademicController.uploadManualData);
router.post('/courses/:courseId/predict-preview', teacherAcademicController.predictPreview);

module.exports = router;
