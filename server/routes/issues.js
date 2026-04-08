const express = require('express');
const router = express.Router();
const { getIssues, getIssueById, createIssue, updateIssueStatus, assignIssue, deleteIssue, getIssueStats } = require('../controllers/issueController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, getIssues);
router.get('/stats', protect, getIssueStats);
router.get('/:id', protect, getIssueById);
router.post('/', protect, authorize('citizen', 'admin'), createIssue);
router.put('/:id/status', protect, authorize('officer', 'admin', 'authority'), updateIssueStatus);
router.put('/:id/assign', protect, authorize('admin', 'authority'), assignIssue);
router.delete('/:id', protect, authorize('admin'), deleteIssue);

module.exports = router;
