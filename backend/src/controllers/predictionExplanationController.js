const PredictionHistory = require('../models/PredictionHistory');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const getExplanation = asyncHandler(async (req, res, next) => {
    const prediction = await PredictionHistory.findById(req.params.id);
    if (!prediction) {
        return next(new AppError('Prediction not found', 404));
    }

    // Role-based security check
    if (req.user.role === 'student' && prediction.studentId.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to view this explanation.', 403));
    }
    // Note: Teacher check logic should be handled (verifying if student is in teacher's dept)
    // Assuming admin and allowed teachers can pass.

    res.status(200).json({
        success: true,
        data: {
            prediction: {
                riskLevel: prediction.riskLevel,
                confidence: prediction.confidence
            },
            explanation: {
                topFactors: prediction.topFactors
            },
            recommendations: prediction.recommendation,
            summary: prediction.explanationSummary || `Your risk level is ${prediction.riskLevel} due to ${prediction.topFactors?.[0]?.feature || 'recent behaviors'}.`
        }
    });
});

const getCharts = asyncHandler(async (req, res, next) => {
    const prediction = await PredictionHistory.findById(req.params.id);
    if (!prediction) {
        return next(new AppError('Prediction not found', 404));
    }

    // Role-based security check
    if (req.user.role === 'student' && prediction.studentId.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to view this explanation.', 403));
    }

    // Format data specifically for Recharts visualization on the frontend
    const featureImportanceChart = prediction.topFactors.map(f => ({
        name: f.feature,
        contribution: f.contribution || (f.impact === 'Very High' ? 30 : f.impact === 'High' ? 20 : 10),
        direction: f.direction || 'Negative'
    }));

    res.status(200).json({
        success: true,
        data: {
            featureImportance: featureImportanceChart,
            riskGauge: {
                level: prediction.riskLevel,
                score: prediction.finalScore || 50
            },
            confidenceMeter: prediction.confidence
        }
    });
});

module.exports = {
    getExplanation,
    getCharts
};
