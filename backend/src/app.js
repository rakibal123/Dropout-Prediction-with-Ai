const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const apiRouter = require('./routes');
const notFoundHandler = require('./middleware/notFound');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. CORS Policy Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// 3. HTTP Request Logging (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Request Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret_fallback'));

// 5. Static File Serving (e.g. Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Base API Router Mounting
app.use('/api/v1', apiRouter);

// Legacy Route Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/predict'));

// Base Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Student Dropout Risk Prediction System API Server',
    version: '1.0.0',
    healthCheck: '/api/v1/health'
  });
});

// 7. 404 Route Not Found Middleware
app.use(notFoundHandler);

// 8. Global Error Handler Middleware
app.use(globalErrorHandler);

module.exports = app;
