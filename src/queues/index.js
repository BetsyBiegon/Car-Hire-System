const Queue = require('bull');
const logger = require('../config/logger');

const redisConfig = { redis: process.env.REDIS_URL || 'redis://localhost:6379' };

const emailQueue = new Queue('email', redisConfig);
const reminderQueue = new Queue('reminders', redisConfig);

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err);
});

reminderQueue.on('failed', (job, err) => {
  logger.error(`Reminder job ${job.id} failed:`, err);
});

module.exports = { emailQueue, reminderQueue };
