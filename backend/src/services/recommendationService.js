const Recommendation = require('../models/Recommendation');
const PredictionHistory = require('../models/PredictionHistory');
const BehaviorRecord = require('../models/BehaviorRecord');
const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');

class RecommendationService {
    async generateRecommendation(predictionId) {
        try {
            const prediction = await PredictionHistory.findById(predictionId).populate('studentId');
            if (!prediction) return null;

            const student = prediction.studentId;
            
            // Get previous prediction to check risk change
            const previousPrediction = await PredictionHistory.findOne({
                studentId: student._id,
                _id: { $ne: prediction._id }
            }).sort({ createdAt: -1 });

            let riskIncreased = false;
            let riskDecreased = false;

            if (previousPrediction) {
                const riskLevels = { 'Low': 1, 'Medium': 2, 'High': 3 };
                const prevLevel = riskLevels[previousPrediction.riskLevel] || 1;
                const currLevel = riskLevels[prediction.riskLevel] || 1;
                
                if (currLevel > prevLevel) riskIncreased = true;
                if (currLevel < prevLevel) riskDecreased = true;
            }

            // If risk decreased to Low, we could optionally just congratulate
            if (riskDecreased && prediction.riskLevel === 'Low') {
                await this.sendNotification(student._id, null, 'Risk Improved', 'Congratulations! Your dropout risk has decreased.', 'INFO');
            }

            // Determine priority
            let priority = 'Low';
            if (prediction.riskLevel === 'High') priority = riskIncreased ? 'Critical' : 'High';
            if (prediction.riskLevel === 'Medium') priority = riskIncreased ? 'High' : 'Medium';

            // Generate Goals
            const goals = this.createGoals(prediction.riskLevel, prediction.topFactors || []);

            // Generate Recommendation Document
            const recommendation = new Recommendation({
                studentId: student._id,
                predictionId: prediction._id,
                riskLevel: prediction.riskLevel,
                recommendationType: prediction.riskLevel === 'High' ? 'Urgent Intervention' : (prediction.riskLevel === 'Medium' ? 'Academic Support' : 'Maintenance'),
                priority,
                title: `${prediction.riskLevel} Risk Academic Intervention Plan`,
                description: `Generated intervention plan based on latest AI prediction. ${riskIncreased ? 'Risk level has increased since last assessment.' : ''}`,
                goals,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week default
            });

            await recommendation.save();

            // Notifications
            await this.sendNotification(student._id, null, 'New Recommendation Available', 'A new personalized academic plan has been generated for you.', 'INFO');
            
            // Notify teachers of this student (mocking by sending to any teacher or we could find specific teacher)
            const teachers = await User.find({ role: 'teacher' }).limit(3);
            if (prediction.riskLevel === 'High' || prediction.riskLevel === 'Medium') {
                for (const teacher of teachers) {
                    await this.sendNotification(teacher._id, student._id, 'Student Requires Intervention', `${student.fullName} has been marked as ${prediction.riskLevel} risk.`, 'WARNING');
                }
            }

            // Notify admins if critical
            if (priority === 'Critical') {
                const admins = await User.find({ role: 'admin' }).limit(3);
                for (const admin of admins) {
                    await this.sendNotification(admin._id, student._id, 'Critical Student Detected', `${student.fullName} has critical risk level requiring immediate attention.`, 'URGENT');
                }
            }

            return recommendation;
        } catch (error) {
            logger.error(`Error generating recommendation: ${error.message}`);
            throw error;
        }
    }

    createGoals(riskLevel, factors) {
        const goals = [];
        
        if (riskLevel === 'High') {
            goals.push({ type: 'Daily', title: 'Attendance Goal', description: 'Attend all classes without exception.' });
            goals.push({ type: 'Weekly', title: 'Counseling Goal', description: 'Schedule and attend immediate counseling.' });
            goals.push({ type: 'Monthly', title: 'Academic Recovery', description: 'Meet with teacher mentor weekly to track progress.' });
        } else if (riskLevel === 'Medium') {
            goals.push({ type: 'Daily', title: 'Study Goal', description: 'Study at least 2 hours daily.' });
            goals.push({ type: 'Weekly', title: 'Assignment Goal', description: 'Complete all pending assignments.' });
            goals.push({ type: 'Monthly', title: 'Attendance Improvement', description: 'Increase attendance to at least 85%.' });
        } else {
            goals.push({ type: 'Weekly', title: 'Maintenance Goal', description: 'Maintain current performance and attendance.' });
            goals.push({ type: 'Monthly', title: 'Extracurricular Goal', description: 'Participate in extracurricular activities.' });
        }
        
        return goals;
    }

    async sendNotification(receiverId, senderId, title, message, priority) {
        try {
            await Notification.create({
                receiverId,
                senderId,
                title,
                message,
                type: 'SYSTEM_ALERT',
                priority,
                role: 'SYSTEM',
                isRead: false
            });
        } catch (error) {
            logger.error(`Notification Error: ${error.message}`);
        }
    }

    async getRecommendations(query) {
        return await Recommendation.find(query)
            .populate('studentId', 'fullName email')
            .populate('assignedTeacher', 'fullName email')
            .sort({ createdAt: -1 });
    }

    async getRecommendationById(id) {
        return await Recommendation.findById(id)
            .populate('studentId', 'fullName email')
            .populate('assignedTeacher', 'fullName email');
    }

    async updateRecommendation(id, data) {
        return await Recommendation.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteRecommendation(id) {
        return await Recommendation.findByIdAndDelete(id);
    }
}

module.exports = new RecommendationService();
