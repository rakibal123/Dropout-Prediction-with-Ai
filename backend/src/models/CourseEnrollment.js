const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
    studentId: {
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
    status: {
        type: String,
        enum: ['Enrolled', 'Completed', 'Dropped', 'Failed'],
        default: 'Enrolled'
    }
}, { timestamps: true });

// Prevent duplicate enrollment
courseEnrollmentSchema.index({ studentId: 1, courseId: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model('CourseEnrollment', courseEnrollmentSchema);
