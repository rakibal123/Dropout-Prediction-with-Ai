const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    number: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    academicYear: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);
