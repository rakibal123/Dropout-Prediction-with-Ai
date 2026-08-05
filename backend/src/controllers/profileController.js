const profileService = require('../services/profileService');
const asyncHandler = require('../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
});

const updateProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data: profile, message: "Profile updated successfully" });
});

const updateAvatar = asyncHandler(async (req, res) => {
    // Assuming file upload middleware has processed the image and returned a path/URL
    // In a real app, integrate Cloudinary here. For now, we'll use req.file.path or a mocked URL.
    const avatarPath = req.file ? `/uploads/${req.file.filename}` : (req.body.profileImage || 'default.jpg');
    const profile = await profileService.updateAvatar(req.user.id, avatarPath);
    res.status(200).json({ success: true, data: profile, message: "Avatar updated successfully" });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await profileService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({ success: true, message: "Password changed successfully" });
});

const getSessions = asyncHandler(async (req, res) => {
    const sessions = await profileService.getSessions(req.user.id);
    res.status(200).json({ success: true, data: sessions });
});

const deleteSession = asyncHandler(async (req, res) => {
    await profileService.deleteSession(req.user.id, req.params.sessionId);
    res.status(200).json({ success: true, message: "Session terminated" });
});

const logoutAll = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    await profileService.logoutAll(req.user.id, token);
    res.status(200).json({ success: true, message: "Logged out from all other devices" });
});

const updatePreferences = asyncHandler(async (req, res) => {
    const profile = await profileService.updatePreferences(req.user.id, req.body);
    res.status(200).json({ success: true, data: profile, message: "Preferences updated" });
});

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
