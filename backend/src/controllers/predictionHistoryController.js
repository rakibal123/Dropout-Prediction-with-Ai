const asyncHandler = require('../utils/asyncHandler');
const predictionHistoryService = require('../services/predictionHistoryService');

const getPredictionHistory = asyncHandler(async (req, res) => {
    const queryParams = req.query;
    const result = await predictionHistoryService.getStudentPredictionHistory(req.user._id, queryParams);

    res.status(200).json({
        success: true,
        data: result
    });
});

module.exports = {
    getPredictionHistory
};
