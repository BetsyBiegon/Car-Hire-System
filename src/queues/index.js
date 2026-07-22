const Queue = require('bull');
const logger = require('../config/logger');

const redisConfig = { redis: process.env.REDIS_URL || 'redis://localhost:6379' };

let emailQueue, reminderQueue;

try {
  emailQueue = new Queue('email', redisConfig);
  reminderQueue = new Queue('reminders', redisConfig);

  emailQueue.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed:`, err);
  });

  reminderQueue.on('failed', (job, err) => {
    logger.error(`Reminder job ${job.id} failed:`, err);
  });
} catch (err) {
  logger.warn('Bull queue init failed — queues disabled:', err.message);
  // Stub queues so the app doesn't crash when Redis is unavailable
  const stub = { add: async () => null, process: () => null, on: () => null };
  emailQueue = stub;
  reminderQueue = stub;
}

module.exports = { emailQueue, reminderQueue };
