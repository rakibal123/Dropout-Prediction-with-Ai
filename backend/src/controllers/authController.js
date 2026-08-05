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

const generateTokens = require('../middleware/generateToken');

const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await authService.loginUser(email, password);
        const { accessToken, refreshToken } = generateTokens(res, user);
        
        const Session = require('../models/Session');
        await Session.create({
            userId: user._id,
            token: refreshToken,
            device: 'Web Browser',
            browser: req.headers['user-agent'] || 'Unknown',
            os: 'Unknown OS',
            ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown IP'
        });
        
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token: accessToken,
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
    // Optionally remove the Session document from the database
    // For simplicity, we just clear the cookies on the client side
    res.cookie('jwt', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
});

const refresh = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;
    
    if (!incomingRefreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token not found. Please log in again.' });
    }

    const jwt = require('jsonwebtoken');
    const Session = require('../models/Session');
    const User = require('../models/User');
    
    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        
        const session = await Session.findOne({ token: incomingRefreshToken, userId: decoded.userId });
        if (!session) {
            return res.status(401).json({ success: false, message: 'Invalid session. Please log in again.' });
        }
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists.' });
        }

        // Generate new tokens (rotating the refresh token as well)
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(res, user);

        // Update the session in DB
        session.token = newRefreshToken;
        session.lastActive = Date.now();
        await session.save();

        res.status(200).json({
            success: true,
            token: accessToken
        });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token. Please log in again.' });
    }
});

module.exports = {
    register,
    login,
    getMe,
    logout,
    refresh
};
