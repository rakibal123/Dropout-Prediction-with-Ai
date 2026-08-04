const mongoose = require('mongoose');

const behaviorRecordSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    attendancePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    assignmentSubmissionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    quizAverage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    midtermMarks: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    studyHoursPerWeek: {
        type: Number,
        min: 0,
        default: 0
    },
    engagementScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    loginFrequency: {
        type: Number,
        min: 0,
        default: 0
    },
    recordDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate for PredictionHistory
behaviorRecordSchema.virtual('predictionHistory', {
    ref: 'PredictionHistory',
    localField: '_id',
    foreignField: 'behaviorRecordId'
});

const BehaviorRecord = mongoose.model('BehaviorRecord', behaviorRecordSchema);
module.exports = BehaviorRecord;
