const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, approveUser, changeUserRole, deactivateUser, getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, authorize('admin', 'authority'), getAllUsers);
router.get('/stats', protect, authorize('admin'), getUserStats);
router.get('/:id', protect, getUserById);
router.put('/:id/approve', protect, authorize('admin'), approveUser);
router.put('/:id/role', protect, authorize('admin'), changeUserRole);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateUser);

module.exports = router;
