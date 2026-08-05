const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    messageType: {
        type: String,
        enum: ['text', 'file'],
        default: 'text'
    },
    text: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    file: {
        type: String // To prepare for future file uploads
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
