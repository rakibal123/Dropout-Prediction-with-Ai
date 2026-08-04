const asyncHandler = require('../middleware/asyncHandler');
const studentService = require('../services/studentService');

const getDashboard = asyncHandler(async (req, res) => {
    const data = await studentService.getStudentDashboard(req.user._id);
    res.status(200).json({ success: true, data });
});

const getProfile = asyncHandler(async (req, res) => {
    const data = await studentService.getStudentProfile(req.user._id);
    res.status(200).json({ success: true, data });
});

const getLatestPrediction = asyncHandler(async (req, res) => {
    const data = await studentService.getLatestPrediction(req.user._id);
    res.status(200).json({ success: true, data });
});

const getLatestBehavior = asyncHandler(async (req, res) => {
    const data = await studentService.getLatestBehavior(req.user._id);
    res.status(200).json({ success: true, data });
});

module.exports = {
    getDashboard,
    getProfile,
    getLatestPrediction,
    getLatestBehavior
};
