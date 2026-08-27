const axios = require('axios');
const BehaviorRecord = require('../models/BehaviorRecord');
const PredictionHistory = require('../models/PredictionHistory');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;

const fetchMLPrediction = async (payload) => {
    let attempt = 0;
    while (attempt <= MAX_RETRIES) {
        try {
            const response = await axios.post(ML_SERVICE_URL, payload, {
                timeout: TIMEOUT_MS
            });
            return response.data;
        } catch (error) {
            attempt++;
            logger.error(`ML Service Prediction Failed (Attempt ${attempt}/${MAX_RETRIES + 1}): ${error.message}`);
            if (attempt > MAX_RETRIES) {
                throw new AppError("Prediction service unavailable.", 503);
            }
        }
    }
};

const predict = async (behaviorRecordId, studentId) => {
    const behavior = await BehaviorRecord.findById(behaviorRecordId);
    if (!behavior) {
        throw new AppError("Behavior record not found", 404);
    }
    
    if (behavior.studentId.toString() !== studentId.toString()) {
        throw new AppError("Unauthorized access to this behavior record", 403);
    }

    // Prepare payload exactly matching the FastAPI contract
    const mlPayload = {
        attendancePercentage: behavior.attendancePercentage,
        assignmentSubmissionRate: behavior.assignmentSubmissionRate,
        quizAverage: behavior.quizAverage,
        midtermMarks: behavior.midtermMarks,
        studyHoursPerWeek: behavior.studyHoursPerWeek,
        engagementScore: behavior.engagementScore,
        loginFrequency: behavior.loginFrequency,
        participationScore: behavior.participationScore,
        stressLevel: behavior.stressLevel,
        motivationLevel: behavior.motivationLevel
    };

    // Call ML Service with Retry & Timeout
    const mlResponse = await fetchMLPrediction(mlPayload);

    if (!mlResponse.success) {
        throw new AppError("ML Prediction failed internally.", 500);
    }

    // Save PredictionHistory exactly matching the new Mongoose Schema
    const predictionData = mlResponse.prediction;
    const explanationData = mlResponse.explanation;
    const modelData = mlResponse.model;
    const metadata = mlResponse.metadata;

    const predictionHistory = new PredictionHistory({
        studentId,
        behaviorRecordId,
        riskLevel: predictionData.riskLevel,
        finalScore: predictionData.finalScore,
        confidence: predictionData.confidence,
        probability: predictionData.probability,
        topFactors: explanationData.topFactors,
        recommendation: mlResponse.recommendation,
        modelName: modelData.name,
        modelVersion: modelData.version,
        predictionTimestamp: new Date(metadata.predictionTimestamp),
        processingTime: metadata.processingTimeMs
    });

    await predictionHistory.save();

    // Asynchronously generate recommendations to not block the <300ms response time
    const recommendationService = require('./recommendationService');
    recommendationService.generateRecommendation(predictionHistory._id).catch(err => {
        logger.error(`Failed to generate async recommendation: ${err.message}`);
    });

    return {
        // Old Contract Compatibility
        riskLevel: predictionData.riskLevel,
        finalScore: predictionData.finalScore,
        riskProbability: predictionData.probability.high,
        recommendation: mlResponse.recommendation,
        predictionMethod: modelData.name,
        predictionVersion: modelData.version,
        
        // Full ML Response Data
        mlResponse: mlResponse
    };
};

const predictPreview = async (behaviorData) => {
    // Prepare payload exactly matching the FastAPI contract
    const mlPayload = {
        attendancePercentage: behaviorData.attendancePercentage || 0,
        assignmentSubmissionRate: behaviorData.assignmentSubmissionRate || 0,
        quizAverage: behaviorData.quizAverage || 0,
        midtermMarks: behaviorData.midtermMarks || 0,
        studyHoursPerWeek: behaviorData.studyHoursPerWeek || 0,
        engagementScore: (behaviorData.classEngagement || 0) / 10,
        loginFrequency: behaviorData.loginFrequency || 0,
        participationScore: (behaviorData.participationInActivities || 0) / 10,
        stressLevel: behaviorData.stressLevel || 5,
        motivationLevel: behaviorData.academicMotivation || 5
    };

    // Call ML Service with Retry & Timeout
    const mlResponse = await fetchMLPrediction(mlPayload);

    if (!mlResponse.success) {
        throw new AppError("ML Prediction failed internally.", 500);
    }

    const predictionData = mlResponse.prediction;
    const explanationData = mlResponse.explanation;

    return {
        riskLevel: predictionData.riskLevel,
        finalScore: predictionData.finalScore,
        confidence: predictionData.confidence,
        probability: predictionData.probability,
        topFactors: explanationData.topFactors,
        recommendation: mlResponse.recommendation
    };
};

const predictForCourse = async (courseStudentDataId) => {
    const CourseStudentData = require('../models/CourseStudentData');
    const courseData = await CourseStudentData.findById(courseStudentDataId);
    if (!courseData) {
        throw new AppError("Course student data not found", 404);
    }

    // Map course data to ML payload
    const mlPayload = {
        attendancePercentage: courseData.attendancePercentage || 0,
        assignmentSubmissionRate: courseData.assignmentSubmissionRate || 0,
        quizAverage: courseData.quizAverage || 0,
        midtermMarks: courseData.midtermMarks || 0,
        studyHoursPerWeek: courseData.studyHoursPerWeek || 0,
        engagementScore: (courseData.classEngagement || 0) / 10,
        // Since we don't have loginFrequency in courseData exactly, we might default to 5 or extract from somewhere else
        loginFrequency: 5,
        participationScore: (courseData.participationInActivities || 0) / 10,
        stressLevel: 5, // Default or placeholder
        motivationLevel: 5 // Default or placeholder
    };

    const mlResponse = await fetchMLPrediction(mlPayload);

    if (!mlResponse.success) {
        throw new AppError("ML Prediction failed internally.", 500);
    }

    const predictionData = mlResponse.prediction;
    const explanationData = mlResponse.explanation;
    const modelData = mlResponse.model;
    const metadata = mlResponse.metadata;

    // Update the course data with the risk
    courseData.courseRiskLevel = predictionData.riskLevel;
    courseData.courseRiskProbability = predictionData.probability.high || predictionData.confidence;
    await courseData.save();

    // Create PredictionHistory for course
    const predictionHistory = new PredictionHistory({
        studentId: courseData.studentId,
        courseId: courseData.courseId,
        semesterId: courseData.semesterId,
        riskLevel: predictionData.riskLevel,
        finalScore: predictionData.finalScore,
        confidence: predictionData.confidence,
        probability: predictionData.probability,
        topFactors: explanationData.topFactors,
        recommendation: mlResponse.recommendation,
        modelName: modelData.name,
        modelVersion: modelData.version,
        predictionTimestamp: new Date(metadata.predictionTimestamp),
        processingTime: metadata.processingTimeMs
    });

    await predictionHistory.save();

    // Asynchronously generate recommendations
    const recommendationService = require('./recommendationService');
    recommendationService.generateRecommendation(predictionHistory._id).catch(err => {
        logger.error(`Failed to generate async recommendation: ${err.message}`);
    });

    return courseData;
};

module.exports = {
    predict,
    predictPreview,
    predictForCourse
};
