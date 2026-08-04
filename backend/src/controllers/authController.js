const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
    try {
        await authService.registerStudent(req.body);
        
        res.status(201).json({
            success: true,
            message: "Your account request has been submitted successfully. Please wait for approval by the authority."
        });
    } catch (error) {
        // We handle custom errors thrown by the service
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        
        // Handle Mongoose duplicate key errors that might have slipped through
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Database Error: Duplicate field value entered'
            });
        }

        // Generic error
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

const generateToken = require('../middleware/generateToken');

const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await authService.loginUser(email, password);
        const token = generateToken(res, user);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

const getMe = asyncHandler(async (req, res) => {
    // req.user is attached by the verifyToken middleware
    res.status(200).json({
        success: true,
        data: {
            id: req.user._id,
            name: req.user.fullName,
            email: req.user.email,
            role: req.user.role,
            department: req.user.department
        }
    });
});

const logout = asyncHandler(async (req, res) => {
    res.cookie('jwt', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // Expire immediately (10s)
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
});

module.exports = {
    register,
    login,
    getMe,
    logout
};
