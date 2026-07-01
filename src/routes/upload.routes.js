const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const uploadController = require('../controllers/upload.controller');

const router = Router();

router.post('/vehicles/:vehicleId/images',
  authenticate, authorize('ADMIN'),
  upload.array('images', 5),
  uploadController.uploadVehicleImages
);

router.delete('/vehicles/:vehicleId/images/:imageId',
  authenticate, authorize('ADMIN'),
  uploadController.deleteVehicleImage
);

router.patch('/vehicles/:vehicleId/images/:imageId/primary',
  authenticate, authorize('ADMIN'),
  uploadController.setPrimaryImage
);

module.exports = router;
