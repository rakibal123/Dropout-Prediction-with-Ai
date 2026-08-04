const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const registerValidator = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    body('rollNumber').optional().trim(),
    body('registrationNumber').optional().trim(),
    body('department').optional().trim(),
    body('semester').optional().trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Errors',
                errors: errors.array()
            });
        }
        next();
    }
];

const loginValidator = [
    body('email').trim().isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid credentials', // Generic message for login
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    registerValidator,
    loginValidator
};
