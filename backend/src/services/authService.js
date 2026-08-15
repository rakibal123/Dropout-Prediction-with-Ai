const User = require('../models/User');

const registerUser = async (userData) => {
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        const error = new Error('Duplicate Email');
        error.statusCode = 400;
        throw error;
    }

    // Check if roll number already exists
    if (userData.rollNumber) {
        const existingRoll = await User.findOne({ rollNumber: userData.rollNumber });
        if (existingRoll) {
            const error = new Error('Duplicate Roll Number');
            error.statusCode = 400;
            throw error;
        }
    }

    // Check if registration number already exists
    if (userData.registrationNumber) {
        const existingReg = await User.findOne({ registrationNumber: userData.registrationNumber });
        if (existingReg) {
            const error = new Error('Duplicate Registration Number');
            error.statusCode = 400;
            throw error;
        }
    }

    const role = userData.role || 'student';
    const isAutoApproved = role === 'admin';

    // Create the user
    const newUser = await User.create({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: role,
        status: isAutoApproved ? 'approved' : 'pending',
        approved: isAutoApproved,
        isActive: true,
        lastLogin: null,
        profileImage: '',
        rollNumber: userData.rollNumber,
        registrationNumber: userData.registrationNumber,
        department: userData.department,
        semester: userData.semester
    });

    return newUser;
};

const loginUser = async (email, password) => {
    // 1. Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401;
        throw error;
    }

    // 2. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401;
        throw error;
    }

    // 3. Role-based checks
    if (user.role !== 'admin') {
        if (user.status === 'pending' || !user.approved) {
            const error = new Error('Your account is waiting for approval.');
            error.statusCode = 403;
            throw error;
        }
        if (user.status === 'rejected') {
            const error = new Error('Your registration request has been rejected. Please contact the administrator.');
            error.statusCode = 403;
            throw error;
        }
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    return user;
};

module.exports = {
    registerUser,
    loginUser
};
