const mongoose = require('mongoose');

const predictionHistorySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional for demo students
        index: true
    },
    behaviorRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BehaviorRecord',
        index: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        index: true
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        index: true
    },
    finalScore: {
        type: Number,
        required: true
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    probability: {
        low: { type: Number },
        medium: { type: Number },
        high: { type: Number }
    },
    topFactors: [{
        feature: { type: String },
        impact: { type: String },
        value: { type: mongoose.Schema.Types.Mixed }
    }],
    recommendation: [{
        type: String,
        trim: true
    }],
    modelName: {
        type: String,
        default: 'Random Forest'
    },
    modelVersion: {
        type: String,
        default: '1.0'
    },
    predictionTimestamp: {
        type: Date
    },
    processingTime: {
        type: Number
    }
}, {
    timestamps: true
});

const PredictionHistory = mongoose.model('PredictionHistory', predictionHistorySchema);
module.exports = PredictionHistory;
