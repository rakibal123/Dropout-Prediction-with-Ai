const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Counselor Assigned', 'Teacher Mentor Assigned', 'Follow-up Scheduled', 'Academic Note Added', 'Improvement Plan Created'],
        required: true
    },
    actionDetails: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
    dueDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Intervention', interventionSchema);
