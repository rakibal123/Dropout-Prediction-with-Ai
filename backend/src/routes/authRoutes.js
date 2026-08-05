const express = require('express');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per window
    message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

const router = express.Router();

router.post('/register', registerValidator, authController.register);

if (process.env.NODE_ENV !== 'test') {
    router.post('/login', loginLimiter, loginValidator, authController.login);
} else {
    router.post('/login', loginValidator, authController.login);
}

// Protected routes
router.get('/me', verifyToken, authController.getMe);
router.post('/logout', verifyToken, authController.logout);

// Refresh Token Route (Not protected by verifyToken because the access token is likely expired)
router.post('/refresh', authController.refresh);

module.exports = router;
