const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    type: { type: String, enum: ['Daily', 'Weekly', 'Monthly'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Failed'], default: 'Pending' }
});

const recommendationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    predictionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PredictionHistory',
        required: false
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    recommendationType: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    goals: [goalSchema],
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    dueDate: {
        type: Date
    },
    assignedTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    progressNotes: [{
        note: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now }
    }],
    improvementScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);
