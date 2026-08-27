const Semester = require('../models/Semester');
const Course = require('../models/Course');
const TeacherCourseAssignment = require('../models/TeacherCourseAssignment');
const User = require('../models/User');

exports.createSemester = async (req, res) => {
    try {
        const semester = await Semester.create(req.body);
        res.status(201).json({ status: 'success', data: { semester } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getAllSemesters = async (req, res) => {
    try {
        const semesters = await Semester.find().sort({ number: 1 });
        res.status(200).json({ status: 'success', results: semesters.length, data: { semesters } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json({ status: 'success', data: { course } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('semesterId');
        res.status(200).json({ status: 'success', results: courses.length, data: { courses } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getCoursesBySemester = async (req, res) => {
    try {
        const courses = await Course.find({ semesterId: req.params.id });
        res.status(200).json({ status: 'success', results: courses.length, data: { courses } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.assignTeacherToCourse = async (req, res) => {
    try {
        const { teacherId, courseId, semesterId, academicYear } = req.body;
        
        // Ensure teacher exists and is a teacher
        const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
        if (!teacher) return res.status(404).json({ status: 'fail', message: 'Teacher not found' });
        
        const assignment = await TeacherCourseAssignment.create({ teacherId, courseId, semesterId, academicYear });
        res.status(201).json({ status: 'success', data: { assignment } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await TeacherCourseAssignment.find()
            .populate('teacherId', 'fullName email')
            .populate('courseId', 'code title')
            .populate('semesterId', 'name number');
        res.status(200).json({ status: 'success', results: assignments.length, data: { assignments } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
