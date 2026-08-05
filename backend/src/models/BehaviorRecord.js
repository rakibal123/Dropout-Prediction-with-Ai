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
        required: true,
        min: 0,
        max: 100
    },
    assignmentSubmissionRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    quizAverage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    midtermMarks: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    studyHoursPerWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 80
    },
    engagementScore: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    loginFrequency: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    participationScore: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    stressLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    motivationLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 10
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
