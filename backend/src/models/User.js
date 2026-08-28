const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'inactive'],
        default: 'pending'
    },
    approved: {
        type: Boolean,
        default: false
    },
    department: {
        type: String,
        trim: true
    },
    currentSemester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        index: true
    },
    rollNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        index: true
    },
    registrationNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        index: true
    },
    phone: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String,
        default: 'default.jpg'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    address: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    shortBio: { type: String, trim: true },
    preferredLanguage: { type: String, default: 'English' },
    timezone: { type: String, default: 'UTC' },
    employeeId: { type: String, trim: true },
    profileVisibility: { type: String, enum: ['Public', 'Institute Only', 'Private'], default: 'Institute Only' },
    notificationPreferences: {
        receivePredictionNotifications: { type: Boolean, default: true },
        receiveTeacherMessages: { type: Boolean, default: true },
        receiveEmailNotifications: { type: Boolean, default: true },
        receiveHighRiskAlerts: { type: Boolean, default: true },
        receiveSystemAnnouncements: { type: Boolean, default: true }
    },
    privacySettings: {
        showPredictionHistory: { type: Boolean, default: true },
        allowTeacherContact: { type: Boolean, default: true }
    },
    lastPasswordChange: { type: Date }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate for StudentProfile
userSchema.virtual('studentProfile', {
    ref: 'StudentProfile',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

// Virtual populate for BehaviorRecords
userSchema.virtual('behaviorRecords', {
    ref: 'BehaviorRecord',
    localField: '_id',
    foreignField: 'studentId'
});

// Virtual populate for Notifications
userSchema.virtual('notifications', {
    ref: 'Notification',
    localField: '_id',
    foreignField: 'userId'
});

// Virtual populate for Sent Messages
userSchema.virtual('sentMessages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'senderId'
});

// Virtual populate for Received Messages
userSchema.virtual('receivedMessages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'receiverId'
});

// Sync status and approved flag before saving
userSchema.pre('save', function (next) {
    if (this.isModified('status') || this.isModified('approved')) {
        if (this.status === 'approved' || this.status === 'active' || this.approved === true) {
            if (this.status !== 'active') this.status = 'approved';
            this.approved = true;
        } else if (this.status === 'pending' || this.status === 'rejected' || this.status === 'inactive' || this.approved === false) {
            this.approved = false;
        }
    }
    next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
