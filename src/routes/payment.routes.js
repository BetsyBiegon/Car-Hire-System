const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

const router = Router();

router.use(authenticate);

router.post('/checkout/:bookingId', paymentController.createCheckout);
router.get('/:bookingId', paymentController.getPayment);
router.post('/webhook', paymentController.stripeWebhook); // raw body needed — handled in controller

module.exports = router;
