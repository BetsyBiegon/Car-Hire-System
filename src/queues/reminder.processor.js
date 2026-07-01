const { reminderQueue } = require('./index');
const { sendEmail } = require('../services/email.service');
const { bookingReminder } = require('../services/email.templates');
const prisma = require('../config/prisma');
const logger = require('../config/logger');

reminderQueue.process(async (job) => {
  const { bookingId } = job.data;
  logger.info(`Processing reminder for booking ${bookingId}`);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      vehicle: true,
      pickupLocation: true,
    },
  });

  if (!booking || booking.status !== 'CONFIRMED') return;

  const template = bookingReminder({
    firstName: booking.user.firstName,
    bookingId: booking.id,
    vehicle: `${booking.vehicle.make} ${booking.vehicle.model}`,
    startDate: booking.startDate,
    pickupLocation: booking.pickupLocation.name,
  });

  await sendEmail({ to: booking.user.email, ...template });
});
