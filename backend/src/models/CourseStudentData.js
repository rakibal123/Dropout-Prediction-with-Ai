const mongoose = require('mongoose');

const courseStudentDataSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional for demo records
        index: true
    },
    demoStudentName: { type: String },
    demoStudentRoll: { type: String },
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
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Teacher
        required: true
    },
    
    // ML Features (Matching existing pipeline conceptually)
    attendancePercentage: { type: Number, min: 0, max: 100 },
    assignmentSubmissionRate: { type: Number, min: 0, max: 100 },
    quizAverage: { type: Number, min: 0, max: 100 },
    ctMarks: { type: Number, min: 0, max: 100 },
    midtermMarks: { type: Number, min: 0, max: 100 },
    finalMarks: { type: Number, min: 0, max: 100 },
    
    studyHoursPerWeek: { type: Number, min: 0 },
    classEngagement: { type: Number, min: 0, max: 100 }, // 0 to 100 scale or similar
    participationInActivities: { type: Number, min: 0, max: 100 },
    missedAssessments: { type: Number, min: 0 },
    
    // Derived/Processed Risk
    courseRiskLevel: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Pending'],
        default: 'Pending'
    },
    courseRiskProbability: { type: Number, min: 0, max: 100 },
    
    // Extraneous
    comments: { type: String, trim: true },
    academicYear: { type: String },
    isDemo: { type: Boolean, default: false }
    
}, { timestamps: true });

// The unique index on { studentId, courseId, semesterId } has been removed to allow multiple demo students
// Uniqueness is enforced dynamically in the controllers via findOneAndUpdate and match queries.

module.exports = mongoose.model('CourseStudentData', courseStudentDataSchema);
