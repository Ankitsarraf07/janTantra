const express = require('express');
const router = express.Router();
const { getAreas, getAreaById, createArea, updateArea, deleteArea } = require('../controllers/areaController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', getAreas); // Public - needed for registration
router.get('/:id', protect, getAreaById);
router.post('/', protect, authorize('admin'), createArea);
router.put('/:id', protect, authorize('admin'), updateArea);
router.delete('/:id', protect, authorize('admin'), deleteArea);

module.exports = router;
