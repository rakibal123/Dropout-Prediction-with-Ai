const User = require('../models/User');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const CourseEnrollment = require('../models/CourseEnrollment');
const CourseStudentData = require('../models/CourseStudentData');
const TeacherCourseAssignment = require('../models/TeacherCourseAssignment');

exports.getCurrentSemester = async (req, res) => {
    try {
        const student = await User.findById(req.user.id).populate('currentSemester');
        res.status(200).json({ status: 'success', data: { currentSemester: student.currentSemester } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getAllSemesters = async (req, res) => {
    try {
        const semesters = await Semester.find({ isActive: true }).sort({ number: 1 });
        res.status(200).json({ status: 'success', data: { semesters } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.updateCurrentSemester = async (req, res) => {
    try {
        const { semesterId } = req.body;
        
        const semester = await Semester.findById(semesterId);
        if (!semester) return res.status(404).json({ status: 'fail', message: 'Semester not found' });
        
        // Prevent downgrading to a previous semester
        const user = await User.findById(req.user.id).populate('currentSemester');
        if (user.currentSemester && user.currentSemester.number > semester.number) {
            return res.status(400).json({ status: 'fail', message: 'You cannot downgrade to a previous semester.' });
        }
        
        // Update user's current semester
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { currentSemester: semesterId }, { new: true }).populate('currentSemester');
        
        // Auto-enroll the student in courses for this semester (if not already enrolled)
        const courses = await Course.find({ semesterId: semester._id });
        for (const course of courses) {
            await CourseEnrollment.updateOne(
                { studentId: req.user.id, courseId: course._id, semesterId: semester._id },
                { status: 'Enrolled' },
                { upsert: true }
            );
        }
        
        res.status(200).json({ status: 'success', data: { currentSemester: updatedUser.currentSemester } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getMyCourses = async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        if (!student.currentSemester) {
            return res.status(200).json({ status: 'success', results: 0, data: { courses: [] } });
        }
        
        const enrollments = await CourseEnrollment.find({ studentId: req.user.id, semesterId: student.currentSemester })
            .populate('courseId');
            
        // For each enrollment, find the assigned teacher and data coverage
        const coursesWithDetails = await Promise.all(enrollments.map(async (enr) => {
            const course = enr.courseId.toObject();
            
            // Find teacher assigned
            const assignment = await TeacherCourseAssignment.findOne({ courseId: course._id, semesterId: student.currentSemester }).populate('teacherId', 'fullName email');
            course.teacher = assignment ? assignment.teacherId : null;
            
            // Check data status
            const data = await CourseStudentData.findOne({ studentId: req.user.id, courseId: course._id, semesterId: student.currentSemester });
            course.dataStatus = data ? 'Available' : 'Pending';
            course.risk = data ? data.courseRiskLevel : 'No Data';
            
            return course;
        }));
        
        res.status(200).json({ status: 'success', results: coursesWithDetails.length, data: { courses: coursesWithDetails } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;
        const student = await User.findById(studentId);
        
        const data = await CourseStudentData.findOne({ studentId, courseId, semesterId: student.currentSemester });
        const course = await Course.findById(courseId);
        
        res.status(200).json({ status: 'success', data: { course, studentData: data } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getSemesterHistory = async (req, res) => {
    try {
        // Find all enrollments grouped by semester
        const enrollments = await CourseEnrollment.find({ studentId: req.user.id })
            .populate('semesterId')
            .populate('courseId');
            
        // This is a simplified grouping for the history view
        const history = {};
        
        for (const enr of enrollments) {
            const semId = enr.semesterId._id.toString();
            if (!history[semId]) {
                history[semId] = {
                    semester: enr.semesterId,
                    courses: []
                };
            }
            history[semId].courses.push(enr.courseId);
        }
        
        res.status(200).json({ status: 'success', data: { history: Object.values(history).sort((a, b) => a.semester.number - b.semester.number) } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
