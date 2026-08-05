const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: [
            'ACCOUNT_APPROVED',
            'ACCOUNT_REJECTED',
            'NEW_MESSAGE',
            'NEW_PREDICTION',
            'HIGH_RISK_ALERT',
            'COUNSELING_REQUEST',
            'TEACHER_NOTE',
            'SYSTEM_ANNOUNCEMENT',
            'PROFILE_UPDATED',
            'PASSWORD_CHANGED'
        ],
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    referenceType: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
