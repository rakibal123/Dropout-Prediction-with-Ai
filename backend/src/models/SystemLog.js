const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    action: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String
    },
    details: {
        type: String
    }
}, {
    timestamps: true
});

const SystemLog = mongoose.model('SystemLog', systemLogSchema);
module.exports = SystemLog;
