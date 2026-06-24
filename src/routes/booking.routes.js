const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const bookingController = require('../controllers/booking.controller');

const router = Router();

router.use(authenticate);

router.get('/', bookingController.getMyBookings);
router.post('/',
  [
    body('vehicleId').notEmpty(),
    body('pickupLocationId').notEmpty(),
    body('dropoffLocationId').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
  ],
  validate,
  bookingController.createBooking
);
router.get('/:id', bookingController.getBookingById);
router.post('/:id/cancel', bookingController.cancelBooking);
router.post('/:id/extend',
  [body('newEndDate').isISO8601()],
  validate,
  bookingController.extendBooking
);

// Admin
router.get('/all', authorize('ADMIN'), bookingController.getAllBookings);
router.patch('/:id/status', authorize('ADMIN'), bookingController.updateBookingStatus);

module.exports = router;
