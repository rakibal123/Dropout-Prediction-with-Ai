const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(verifyToken);

// Admin only routes for managing semesters/courses
router.post('/semesters', authorizeRoles('admin'), academicController.createSemester);
router.post('/courses', authorizeRoles('admin'), academicController.createCourse);
router.post('/assignments', authorizeRoles('admin'), academicController.assignTeacherToCourse);
router.get('/assignments', authorizeRoles('admin'), academicController.getAllAssignments);

// Public (to authenticated users)
router.get('/semesters', academicController.getAllSemesters);
router.get('/semesters/:id/courses', academicController.getCoursesBySemester);
router.get('/courses', academicController.getAllCourses);

module.exports = router;
