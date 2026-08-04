const express = require('express');
const router = express.Router();

const PredictionHistory = require('../models/PredictionHistory');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/predict-risk
 * @desc    Predict student dropout risk based on behavior data and save result
 * @access  Private (Student only)
 */
router.post('/predict-risk', protect, restrictTo('student'), async (req, res) => {
    try {
        const { attendance, submissionRate, ctMark, studyHours } = req.body;
        const studentId = req.user._id;

        // 1) Validate all behavioral fields
        const fields = { attendance, submissionRate, ctMark, studyHours };

        const fieldLabels = {
            attendance: 'Attendance Rate',
            submissionRate: 'Submission Rate',
            ctMark: 'CT Mark',
            studyHours: 'Weekly Study Hours'
        };

        for (const [key, value] of Object.entries(fields)) {
            if (value === undefined || value === null || value === '') {
                return res.status(400).json({
                    status: 'fail',
                    message: `Please provide your ${fieldLabels[key]}. This information is essential for an accurate risk assessment.`
                });
            }
            if (typeof value !== 'number') {
                return res.status(400).json({
                    status: 'fail',
                    message: `The value for ${fieldLabels[key]} must be a valid number.`
                });
            }
            // Basic range validation
            if (value < 0 || value > 100) {
                return res.status(400).json({
                    status: 'fail',
                    message: `${fieldLabels[key]} should be a score or percentage between 0 and 100 for the most accurate results.`
                });
            }
        }

        // 2) Rule-Based Dropout Risk Logic
        let riskLevel = 'Low';
        if (attendance < 60 || submissionRate < 50) {
            riskLevel = 'High';
        } else if (attendance < 75 || ctMark < 60) {
            riskLevel = 'Medium';
        }

        // 3) Probability Calculation
        let probability;
        if (riskLevel === 'High') {
            probability = Math.floor(Math.random() * (90 - 70 + 1)) + 70;
        } else if (riskLevel === 'Medium') {
            probability = Math.floor(Math.random() * (69 - 40 + 1)) + 40;
        } else {
            probability = Math.floor(Math.random() * (30 - 5 + 1)) + 5;
        }

        // 4) Dynamic Reasons Generation
        const reasons = [];
        if (attendance < 75) reasons.push('Low attendance');
        else reasons.push('High attendance');

        if (ctMark < 60) reasons.push('Low CT marks');
        else reasons.push('Good CT marks');

        if (submissionRate < 70) reasons.push('Low submission rate');
        else reasons.push('Good submission rate');

        // 5) Dynamic Suggestions Generation
        let suggestions = [];
        if (riskLevel === 'High') {
            suggestions = ['Contact academic advisor', 'Join peer tutoring', 'Improve class attendance'];
        } else if (riskLevel === 'Medium') {
            suggestions = ['Focus on timely submissions', 'Improve CT scores', 'Attend more classes'];
        } else {
            suggestions = ['Keep up the good work', 'Maintain your current performance level'];
        }

        // 6) Save to Database
        const history = await PredictionHistory.create({
            studentId,
            attendance,
            submissionRate,
            ctMark,
            studyHours,
            riskLevel,
            probability,
            reasons,
            suggestions
        });

        res.status(200).json({
            status: 'success',
            data: {
                id: history._id,
                riskLevel,
                probability,
                reasons,
                suggestions
            }
        });

    } catch (err) {
        console.error('Prediction Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'We encountered an unexpected issue while calculating your risk assessment. Please try again in a few moments.'
        });
    }
});

module.exports = router;
