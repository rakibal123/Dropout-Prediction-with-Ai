const BehaviorRecord = require('../models/BehaviorRecord');
const AppError = require('../utils/appError');

const createBehaviorRecord = async (studentId, data) => {
    // Determine the start and end of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check for duplicate submission today
    const existingRecord = await BehaviorRecord.findOne({
        studentId,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (existingRecord) {
        // Update the existing record for today instead of throwing an error
        Object.assign(existingRecord, {
            attendancePercentage: data.attendancePercentage,
            assignmentSubmissionRate: data.assignmentSubmissionRate,
            quizAverage: data.quizAverage,
            midtermMarks: data.midtermMarks,
            studyHoursPerWeek: data.studyHoursPerWeek,
            engagementScore: data.engagementScore,
            loginFrequency: data.loginFrequency,
            participationScore: data.participationScore,
            stressLevel: data.stressLevel,
            motivationLevel: data.motivationLevel
        });
        await existingRecord.save();
        return existingRecord;
    }

    // Save a new record if none exists for today
    const behaviorRecord = new BehaviorRecord({
        studentId,
        attendancePercentage: data.attendancePercentage,
        assignmentSubmissionRate: data.assignmentSubmissionRate,
        quizAverage: data.quizAverage,
        midtermMarks: data.midtermMarks,
        studyHoursPerWeek: data.studyHoursPerWeek,
        engagementScore: data.engagementScore,
        loginFrequency: data.loginFrequency,
        participationScore: data.participationScore,
        stressLevel: data.stressLevel,
        motivationLevel: data.motivationLevel
    });

    await behaviorRecord.save();
    return behaviorRecord;
};

module.exports = {
    createBehaviorRecord
};
