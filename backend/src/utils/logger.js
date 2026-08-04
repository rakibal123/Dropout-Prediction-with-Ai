const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const formatLog = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
};

const logger = {
  info: (message) => {
    const logStr = formatLog('info', message);
    console.log(`\x1b[36m${logStr}\x1b[0m`);
    try {
      fs.appendFileSync(path.join(logDir, 'app.log'), logStr + '\n');
    } catch (_) {}
  },
  warn: (message) => {
    const logStr = formatLog('warn', message);
    console.warn(`\x1b[33m${logStr}\x1b[0m`);
    try {
      fs.appendFileSync(path.join(logDir, 'app.log'), logStr + '\n');
    } catch (_) {}
  },
  error: (message) => {
    const logStr = formatLog('error', message);
    console.error(`\x1b[31m${logStr}\x1b[0m`);
    try {
      fs.appendFileSync(path.join(logDir, 'error.log'), logStr + '\n');
    } catch (_) {}
  }
};

module.exports = logger;
