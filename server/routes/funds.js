const express = require('express');
const router = express.Router();
const { getFunds, getFundById, allocateFund, updateFund, addTransaction, getFundStats } = require('../controllers/fundController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, getFunds);
router.get('/stats', protect, getFundStats);
router.get('/:id', protect, getFundById);
router.post('/', protect, authorize('authority', 'admin'), allocateFund);
router.put('/:id', protect, authorize('authority', 'admin'), updateFund);
router.post('/:id/transaction', protect, authorize('authority', 'admin'), addTransaction);

module.exports = router;
