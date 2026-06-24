const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/occupancy', adminController.getOccupancyReport);

module.exports = router;
