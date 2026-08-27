const mongoose = require('mongoose');

const uploadRecordSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    totalRecords: {
        type: Number,
        default: 0
    },
    validRecords: {
        type: Number,
        default: 0
    },
    invalidRecords: {
        type: Number,
        default: 0
    },
    academicYear: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('UploadRecord', uploadRecordSchema);
