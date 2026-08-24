const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables
dotenv.config();

const apiRouter = require('./routes');
const notFoundHandler = require('./middleware/notFound');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();

// Trust reverse proxy (e.g. Render/Cloudflare) so rate limiters use the real client IP
app.set('trust proxy', 1);

// 1. Security HTTP Headers
app.use(helmet());

// 1.5 CORS Policy Configuration
const corsOptions = {
  origin: true, // Reflects the incoming origin, fixing CORS dynamically
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};
app.use(cors(corsOptions));

// 1.6 Global Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

if (process.env.NODE_ENV === 'production') {
    app.use('/api', globalLimiter);
}

// 3. HTTP Request Logging (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Request Body, Cookie Parsing & Data Sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret_fallback'));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// 5. Static File Serving (e.g. Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Base API Router Mounting
const mountApiRoutes = (prefix) => {
    app.use(`${prefix}`, apiRouter);
    app.use(`${prefix}/auth`, require('./routes/authRoutes'));
    app.use(`${prefix}/student`, require('./routes/studentRoutes'));
    app.use(`${prefix}/admin`, require('./routes/admin'));
    app.use(`${prefix}/messages`, require('./routes/messageRoutes'));
    app.use(`${prefix}/notifications`, require('./routes/notificationRoutes'));
    app.use(`${prefix}/profile`, require('./routes/profileRoutes'));
    app.use(`${prefix}/student/timeline`, require('./routes/timelineRoutes'));
    app.use(`${prefix}/analytics`, require('./routes/analyticsRoutes'));
    app.use(`${prefix}/admin/system-health`, require('./routes/systemHealthRoutes'));
    app.use(`${prefix}/predictions`, require('./routes/predictionExplanationRoutes'));
    app.use(`${prefix}/recommendations`, require('./routes/recommendationRoutes'));
};

mountApiRoutes('/api');
mountApiRoutes('/api/v1');

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
