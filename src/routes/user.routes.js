const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.delete('/me', userController.deleteMe);

// Admin only
router.get('/', authorize('ADMIN'), userController.getAllUsers);
router.get('/:id', authorize('ADMIN'), userController.getUserById);
router.put('/:id/status', authorize('ADMIN'), userController.toggleUserStatus);

module.exports = router;
