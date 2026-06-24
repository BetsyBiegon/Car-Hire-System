const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const reviewController = require('../controllers/review.controller');

const router = Router();

router.get('/vehicle/:vehicleId', reviewController.getVehicleReviews);
router.post('/',
  authenticate,
  [
    body('vehicleId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim(),
  ],
  validate,
  reviewController.createReview
);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
