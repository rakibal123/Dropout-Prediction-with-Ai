const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true
    },
    device: { type: String, default: 'Unknown Device' },
    browser: { type: String, default: 'Unknown Browser' },
    os: { type: String, default: 'Unknown OS' },
    ipAddress: { type: String, default: 'Unknown IP' },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
