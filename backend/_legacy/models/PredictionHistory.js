const mongoose = require('mongoose');

const PredictionHistorySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student ID is required']
    },
    attendance: {
        type: Number,
        required: [true, 'Attendance is required']
    },
    submissionRate: {
        type: Number,
        required: [true, 'Submission rate is required']
    },
    ctMark: {
        type: Number,
        required: [true, 'CT mark is required']
    },
    studyHours: {
        type: Number,
        required: [true, 'Study hours are required']
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: [true, 'Risk level is required']
    },
    probability: {
        type: Number,
        required: [true, 'Probability is required']
    },
    reasons: {
        type: [String],
        default: []
    },
    suggestions: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PredictionHistory', PredictionHistorySchema);
