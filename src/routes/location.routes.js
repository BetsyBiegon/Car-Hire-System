const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const locationController = require('../controllers/location.controller');

const router = Router();

router.get('/', locationController.getLocations);
router.post('/', authenticate, authorize('ADMIN'), locationController.createLocation);
router.put('/:id', authenticate, authorize('ADMIN'), locationController.updateLocation);
router.delete('/:id', authenticate, authorize('ADMIN'), locationController.deleteLocation);

module.exports = router;
