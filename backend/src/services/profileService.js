const User = require('../models/User');
const Session = require('../models/Session');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');

const getProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
};

const updateProfile = async (userId, data) => {
    // Prevent sensitive fields from being updated directly here
    const { email, role, rollNumber, registrationNumber, department, password, ...allowedUpdates } = data;
    
    const user = await User.findByIdAndUpdate(userId, allowedUpdates, {
        new: true,
        runValidators: true
    });
    
    if (!user) throw new AppError('User not found', 404);
    return user;
};

const updateAvatar = async (userId, avatarPath) => {
    const user = await User.findByIdAndUpdate(userId, { profileImage: avatarPath }, { new: true });
    return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404);
    
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) throw new AppError('Incorrect current password', 401);
    
    user.password = newPassword;
    user.lastPasswordChange = Date.now();
    await user.save();
    
    // Invalidate other sessions
    await Session.deleteMany({ userId, token: { $ne: 'CURRENT_TOKEN_PLACEHOLDER' } });
    
    return true;
};

const getSessions = async (userId) => {
    return await Session.find({ userId }).sort('-lastActive');
};

const deleteSession = async (userId, sessionId) => {
    const session = await Session.findOneAndDelete({ _id: sessionId, userId });
    if (!session) throw new AppError('Session not found', 404);
    return true;
};

const logoutAll = async (userId, currentToken) => {
    await Session.deleteMany({ userId, token: { $ne: currentToken } });
    return true;
};

const updatePreferences = async (userId, data) => {
    const user = await User.findByIdAndUpdate(userId, {
        notificationPreferences: data.notificationPreferences,
        privacySettings: data.privacySettings
    }, { new: true });
    return user;
};

module.exports = {
    getProfile,
    updateProfile,
    updateAvatar,
    changePassword,
    getSessions,
    deleteSession,
    logoutAll,
    updatePreferences
};
