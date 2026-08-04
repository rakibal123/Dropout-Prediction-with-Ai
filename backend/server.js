const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

// Uncaught Exception Handler
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! 💥 ${err.name}: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Connect to Database and Bootstrap Server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
  });

  // Unhandled Rejection Handler
  process.on('unhandledRejection', (err) => {
    logger.error(`UNHANDLED REJECTION! 💥 ${err.name}: ${err.message}`);
    logger.error(err.stack);
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful Shutdown Handlers
  const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}. Gracefully shutting down HTTP server...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
});
