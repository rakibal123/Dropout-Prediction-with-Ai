const { body } = require('express-validator');

const behaviorValidator = [
    body('attendancePercentage')
        .notEmpty().withMessage('Attendance percentage is required')
        .isFloat({ min: 0, max: 100 }).withMessage('Attendance percentage must be between 0 and 100'),
    
    body('assignmentSubmissionRate')
        .notEmpty().withMessage('Assignment submission rate is required')
        .isFloat({ min: 0, max: 100 }).withMessage('Assignment submission rate must be between 0 and 100'),
        
    body('quizAverage')
        .notEmpty().withMessage('Quiz average is required')
        .isFloat({ min: 0, max: 100 }).withMessage('Quiz average must be between 0 and 100'),
        
    body('midtermMarks')
        .notEmpty().withMessage('Midterm marks are required')
        .isFloat({ min: 0, max: 100 }).withMessage('Midterm marks must be between 0 and 100'),
        
    body('studyHoursPerWeek')
        .notEmpty().withMessage('Study hours per week are required')
        .isFloat({ min: 0, max: 80 }).withMessage('Study hours per week must be between 0 and 80'),
        
    body('engagementScore')
        .notEmpty().withMessage('Engagement score is required')
        .isFloat({ min: 1, max: 10 }).withMessage('Engagement score must be between 1 and 10'),
        
    body('loginFrequency')
        .notEmpty().withMessage('Login frequency is required')
        .isFloat({ min: 0, max: 100 }).withMessage('Login frequency must be between 0 and 100'),
        
    body('participationScore')
        .notEmpty().withMessage('Participation score is required')
        .isFloat({ min: 1, max: 10 }).withMessage('Participation score must be between 1 and 10'),
        
    body('stressLevel')
        .notEmpty().withMessage('Stress level is required')
        .isFloat({ min: 1, max: 10 }).withMessage('Stress level must be between 1 and 10'),
        
    body('motivationLevel')
        .notEmpty().withMessage('Motivation level is required')
        .isFloat({ min: 1, max: 10 }).withMessage('Motivation level must be between 1 and 10')
];

module.exports = {
    behaviorValidator
};
