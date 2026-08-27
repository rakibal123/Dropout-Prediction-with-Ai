const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    credit: {
        type: Number,
        required: true,
        min: 0.5
    },
    type: {
        type: String,
        enum: ['Theory', 'Laboratory', 'Project/Thesis', 'Industrial Training'],
        default: 'Theory'
    },
    department: {
        type: String,
        default: 'CSE'
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Prevent duplicate course codes within the same semester
courseSchema.index({ code: 1, semesterId: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
