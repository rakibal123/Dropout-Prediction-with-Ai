const jwt = require('jsonwebtoken');

const generateTokens = (res, user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };

    // Short-lived access token (15 minutes)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });

    // Long-lived refresh token (7 days)
    const refreshToken = jwt.sign(
        { userId: user._id, version: user.lastPasswordChange ? user.lastPasswordChange.getTime() : 0 }, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
        { expiresIn: '7d' }
    );

    // Set Access Token as an HttpOnly cookie
    res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Set Refresh Token as an HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return { accessToken, refreshToken };
};

module.exports = generateTokens;
