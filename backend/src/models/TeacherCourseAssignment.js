const mongoose = require('mongoose');

const teacherCourseAssignmentSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true,
        index: true
    },
    academicYear: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Prevent duplicate assignment of the same course to the same teacher in the same semester
teacherCourseAssignmentSchema.index({ teacherId: 1, courseId: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model('TeacherCourseAssignment', teacherCourseAssignmentSchema);
