const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const PredictionHistory = require('../models/PredictionHistory');
const BehaviorRecord = require('../models/BehaviorRecord');

const getStudentDashboard = async (userId) => {
    const [user, profile, latestPrediction, predictionCount] = await Promise.all([
        User.findById(userId).populate('currentSemester').lean(),
        StudentProfile.findOne({ userId }).lean(),
        PredictionHistory.findOne({ studentId: userId }).sort({ createdAt: -1 }).lean(),
        PredictionHistory.countDocuments({ studentId: userId })
    ]);

    return {
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        registrationNumber: user.registrationNumber,
        department: user.department,
        semester: user.currentSemester ? user.currentSemester.name : null,
        profileImage: user.profileImage,
        currentCGPA: profile ? profile.currentCGPA : null,
        currentRiskLevel: latestPrediction ? latestPrediction.riskLevel : null,
        lastPredictionDate: latestPrediction ? latestPrediction.createdAt : null,
        predictionCount: predictionCount
    };
};

const getStudentProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    const profile = await StudentProfile.findOne({ userId });

    return {
        user,
        profile
    };
};

const getLatestPrediction = async (userId) => {
    return await PredictionHistory.findOne({ studentId: userId }).sort({ createdAt: -1 });
};

const getLatestBehavior = async (userId) => {
    return await BehaviorRecord.findOne({ studentId: userId }).sort({ recordDate: -1 });
};

module.exports = {
    getStudentDashboard,
    getStudentProfile,
    getLatestPrediction,
    getLatestBehavior
};
