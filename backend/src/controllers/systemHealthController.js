const systemHealthService = require('../services/systemHealthService');
const asyncHandler = require('../utils/asyncHandler');

const getSystemHealth = asyncHandler(async (req, res) => {
    const healthData = await systemHealthService.getSystemHealth();
    res.status(200).json({ success: true, data: healthData });
});

module.exports = {
    getSystemHealth
};
