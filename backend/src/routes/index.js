const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');

// Health Check Route
router.get('/health', (req, res) => {
  return ApiResponse.success(res, 'Backend API foundation is active', {
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
