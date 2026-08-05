const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const behaviorService = require('../services/behaviorService');
const AppError = require('../utils/appError');

const submitBehavior = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json({ success: false, message: errorMessages, errors: errors.array() });
    }

    const behaviorRecord = await behaviorService.createBehaviorRecord(req.user._id, req.body);

    res.status(201).json({
        success: true,
        message: "Behavior assessment saved successfully.",
        behaviorRecordId: behaviorRecord._id,
        nextStep: "prediction"
    });
});

module.exports = {
    submitBehavior
};
