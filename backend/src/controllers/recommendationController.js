const recommendationService = require('../services/recommendationService');

const getRecommendations = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') {
            query.studentId = req.user._id;
        } else if (req.user.role === 'teacher') {
            // Can see all for simplicity or only assigned
        }
        const recommendations = await recommendationService.getRecommendations(query);
        res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getRecommendationById = async (req, res) => {
    try {
        const recommendation = await recommendationService.getRecommendationById(req.params.id);
        if (!recommendation) {
            return res.status(404).json({ success: false, message: 'Recommendation not found' });
        }
        
        // Security check
        if (req.user.role === 'student' && recommendation.studentId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: recommendation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createRecommendation = async (req, res) => {
    try {
        const recommendation = await recommendationService.generateRecommendation(req.body.predictionId);
        res.status(201).json({ success: true, data: recommendation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateRecommendation = async (req, res) => {
    try {
        const recommendation = await recommendationService.updateRecommendation(req.params.id, req.body);
        res.status(200).json({ success: true, data: recommendation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteRecommendation = async (req, res) => {
    try {
        await recommendationService.deleteRecommendation(req.params.id);
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getRecommendations,
    getRecommendationById,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation
};
