const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/adminService');
const SystemLog = require('../models/SystemLog');

const getDashboard = asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
});

const getUsers = asyncHandler(async (req, res) => {
    const users = await adminService.getUsers(req.query);
    res.status(200).json({ success: true, data: users });
});

const getUserById = asyncHandler(async (req, res) => {
    const data = await adminService.getUserById(req.params.id);
    res.status(200).json({ success: true, data });
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await adminService.updateUser(req.params.id, req.body, req.user._id, req.ip);
    res.status(200).json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
    await adminService.deleteUser(req.params.id, req.user._id, req.ip);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
});

const getAnalytics = asyncHandler(async (req, res) => {
    const analytics = await adminService.getAnalytics();
    res.status(200).json({ success: true, data: analytics });
});

const getReports = asyncHandler(async (req, res) => {
    const { type } = req.query;
    // Just a placeholder for returning basic data for reports
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data: { type, generatedAt: new Date(), stats } });
});

const getSystemLogs = asyncHandler(async (req, res) => {
    const logs = await adminService.getSystemLogs(req.query);
    res.status(200).json({ success: true, data: logs });
});

const logAdminAction = async (userId, action, ipAddress) => {
    await SystemLog.create({ userId, action, ipAddress });
};

// Legacy support for approve/reject logic if still needed directly, 
// though updateUser can handle { status: 'approved' }
const approveStudent = asyncHandler(async (req, res) => {
    const user = await adminService.updateUser(req.params.id, { status: 'approved' }, req.user._id, req.ip);
    res.status(200).json({ success: true, data: user });
});

const rejectStudent = asyncHandler(async (req, res) => {
    const user = await adminService.updateUser(req.params.id, { status: 'rejected' }, req.user._id, req.ip);
    res.status(200).json({ success: true, data: user });
});

module.exports = {
    getDashboard,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAnalytics,
    getReports,
    getSystemLogs,
    approveStudent,
    rejectStudent
};
