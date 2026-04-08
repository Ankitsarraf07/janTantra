const express = require('express');
const router = express.Router();
const { submitFeedback, getIssueFeedback, getOfficerFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.post('/', protect, authorize('citizen'), submitFeedback);
router.get('/issue/:issueId', protect, getIssueFeedback);
router.get('/officer/:officerId', protect, getOfficerFeedback);

module.exports = router;
