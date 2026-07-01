const { emailQueue } = require('./index');
const { sendEmail } = require('../services/email.service');
const logger = require('../config/logger');

emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  logger.info(`Processing email job ${job.id} to ${to}`);
  await sendEmail({ to, subject, html });
});
