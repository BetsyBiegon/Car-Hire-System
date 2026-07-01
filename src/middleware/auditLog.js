const prisma = require('../config/prisma');
const logger = require('../config/logger');

/**
 * Middleware factory for audit logging.
 * Usage: router.post('/', auditLog('BOOKING_CREATED', 'Booking'), controller)
 */
function auditLog(action, entity) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      // Only log on success
      if (body?.success && body?.data?.id) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: req.user?.id || null,
              action,
              entity,
              entityId: body.data.id,
              ipAddress: req.ip,
              changes: null,
            },
          });
        } catch (err) {
          logger.error('Audit log failed:', err);
        }
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = { auditLog };
