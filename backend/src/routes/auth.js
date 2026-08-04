const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
};

router.post('/register', async (req, res) => {
    try {
        console.log('Register request body:', req.body);
        const { name, email, password, role, roll_number, registration_number, department } = req.body;

        // 1) Validate all fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ status: 'fail', message: 'Name, email, password, and role are required' });
        }

        // 2) Check if role is valid
        const validRoles = ['student', 'teacher', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid role' });
        }

        // 2.5) Student specific validation
        let userStatus = 'pending';
        let userApproved = false;

        if (role === 'student') {
            if (!roll_number || !registration_number || !department) {
                return res.status(400).json({ status: 'fail', message: 'Roll number, registration number, and department are required for students' });
            }
        } else {
            userStatus = 'approved';
            userApproved = true;
        }

        // 3) Create user (hashing handled in User.js pre-save)
        // MongoDB unique constraint will throw an error if email exists
        await User.create({
            name, email, password, role,
            roll_number, registration_number, department,
            status: userStatus, approved: userApproved
        });

        // 4) Return success message
        if (role === 'student') {
            res.status(201).json({ message: "Your account is on the way. Please wait for approval by the authority." });
        } else {
            res.status(201).json({ message: "User registered successfully" });
        }
    } catch (err) {
        // Handle duplicate email error (MongoDB code 11000)
        if (err.code === 11000) {
            return res.status(400).json({ status: 'fail', message: 'Email already exists' });
        }

        // Handle validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ status: 'fail', message: err.message });
        }

        console.error('Registration full error:', err);
        res.status(500).json({ status: 'error', message: err.message || 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // 1) Validate input fields
        if (!email || !password || !role) {
            return res.status(400).json({ status: 'fail', message: 'Email, password, and role are required' });
        }

        // 2) Check if user exists (select +password because it's hidden by default)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        // 3) Compare password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ status: 'fail', message: 'Invalid password' });
        }

        // 4) Check if role matches
        if (user.role !== role) {
            return res.status(403).json({ status: 'fail', message: 'Access denied: role mismatch' });
        }

        // 4.5) For students only: check if account is approved
        // Teachers and admins bypass this check entirely
        if (user.role === 'student' && user.status !== 'approved') {
            return res.status(403).json({
                status: 'fail',
                message: 'Your account is not approved yet. Please wait for authority approval.'
            });
        }

        // 5) Generate JWT token (Expires in 1 day)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        // 6) Return success response
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

module.exports = router;
