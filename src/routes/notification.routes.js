const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
