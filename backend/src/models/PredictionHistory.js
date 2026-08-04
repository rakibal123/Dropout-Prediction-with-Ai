const mongoose = require('mongoose');

const predictionHistorySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    behaviorRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BehaviorRecord',
        required: true,
        index: true
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        required: true
    },
    probability: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    predictionMethod: {
        type: String,
        default: 'Machine Learning Model'
    },
    predictionReason: {
        type: String,
        trim: true
    },
    recommendation: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const PredictionHistory = mongoose.model('PredictionHistory', predictionHistorySchema);
module.exports = PredictionHistory;
