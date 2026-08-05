const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDir = path.join(__dirname, '../../logs'); // move logs up to root level of backend

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
});

// Configure daily rotating transports
const fileRotateTransport = new DailyRotateFile({
    filename: 'application-%DATE%.log',
    dirname: logDir,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d', // Keep logs for 14 days
    level: 'info',
});

const errorFileRotateTransport = new DailyRotateFile({
    filename: 'error-%DATE%.log',
    dirname: logDir,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d', // Keep error logs for 30 days
    level: 'error',
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: combine(
        errors({ stack: true }), // capture stack trace
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        fileRotateTransport,
        errorFileRotateTransport,
    ],
    exceptionHandlers: [
        new DailyRotateFile({
            filename: 'exceptions-%DATE%.log',
            dirname: logDir,
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
        })
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            filename: 'rejections-%DATE%.log',
            dirname: logDir,
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
        })
    ]
});

// Add console transport for development/testing
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            logFormat
        )
    }));
}

module.exports = logger;
