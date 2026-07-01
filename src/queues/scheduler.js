const Queue = require('bull');
const prisma = require('../config/prisma');
const { reminderQueue } = require('./index');
const logger = require('../config/logger');

// Runs every day at 8am — queues reminders for bookings starting tomorrow
async function scheduleReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      startDate: { gte: tomorrow, lt: dayAfter },
    },
    select: { id: true },
  });

  for (const booking of bookings) {
    await reminderQueue.add({ bookingId: booking.id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  logger.info(`Scheduled ${bookings.length} reminders for tomorrow's bookings`);
}

// Bull's built-in repeatable job — runs every day at 8:00 AM
async function startScheduler() {
  const schedulerQueue = new Queue('scheduler', {
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  await schedulerQueue.add({}, {
    repeat: { cron: '0 8 * * *' },
    removeOnComplete: true,
  });

  schedulerQueue.process(async () => {
    await scheduleReminders();
  });

  logger.info('Reminder scheduler started');
}

module.exports = { startScheduler, scheduleReminders };
