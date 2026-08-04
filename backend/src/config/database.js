const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_dropout_db';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnected = true;
    logger.info(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnected = false;
    logger.warn(`⚠️ MongoDB Offline: Could not connect to [${mongoUri}]`);
    logger.warn(`👉 To connect a database, start local MongoDB or update MONGO_URI in backend/.env`);

    if (process.env.NODE_ENV === 'production') {
      logger.error('Fatal: Production server requires an active MongoDB database connection. Exiting...');
      process.exit(1);
    }
  }
};

// Runtime Connection Event Handlers (Triggers only after initial successful connection)
mongoose.connection.on('disconnected', () => {
  if (isConnected) {
    isConnected = false;
    logger.warn('MongoDB connection lost. Reconnecting...');
  }
});

mongoose.connection.on('error', (err) => {
  if (isConnected) {
    logger.error(`MongoDB runtime error: ${err.message}`);
  }
});

module.exports = connectDB;
