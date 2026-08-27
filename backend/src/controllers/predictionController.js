const asyncHandler = require('../utils/asyncHandler');
const predictionService = require('../services/predictionService');

const predict = asyncHandler(async (req, res) => {
    const { behaviorRecordId } = req.body;
    
    if (!behaviorRecordId) {
        return res.status(400).json({ success: false, message: "behaviorRecordId is required" });
    }

    const result = await predictionService.predict(behaviorRecordId, req.user._id);

    res.status(200).json({
        success: true,
        ...result
    });
});

const predictPreview = asyncHandler(async (req, res) => {
    const result = await predictionService.predictPreview(req.body);

    res.status(200).json({
        success: true,
        ...result
    });
});

module.exports = {
    predict,
    predictPreview
};
