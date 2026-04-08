const express = require('express');
const router = express.Router();
const { getRankings, getOfficerRanking, getAnalytics } = require('../controllers/rankingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, getRankings);
router.get('/analytics', protect, authorize('authority', 'admin'), getAnalytics);
router.get('/officer/:officerId', protect, getOfficerRanking);

module.exports = router;
