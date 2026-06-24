const { Router } = require('express');
const { body, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const vehicleController = require('../controllers/vehicle.controller');

const router = Router();

// Public
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Admin only
router.post('/',
  authenticate, authorize('ADMIN'),
  [
    body('make').trim().notEmpty(),
    body('model').trim().notEmpty(),
    body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
    body('licensePlate').trim().notEmpty(),
    body('pricePerDay').isDecimal(),
    body('locationId').notEmpty(),
  ],
  validate,
  vehicleController.createVehicle
);

router.put('/:id', authenticate, authorize('ADMIN'), vehicleController.updateVehicle);
router.delete('/:id', authenticate, authorize('ADMIN'), vehicleController.deleteVehicle);
router.patch('/:id/status', authenticate, authorize('ADMIN'), vehicleController.updateVehicleStatus);

module.exports = router;
