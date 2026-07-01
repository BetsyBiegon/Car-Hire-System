require('dotenv').config();
const app = require('./app');
const { connectRedis } = require('./config/redis');
const logger = require('./config/logger');

// Register queue processors
require('./queues/email.processor');
require('./queues/reminder.processor');

const { startScheduler } = require('./queues/scheduler');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectRedis();
    await startScheduler();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
