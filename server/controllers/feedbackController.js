const Feedback = require('../models/Feedback');
const Issue = require('../models/Issue');
const Ranking = require('../models/Ranking');

// @POST /api/feedback — Citizen only
const submitFeedback = async (req, res) => {
  try {
    const { issueId, rating, workStatus, comment } = req.body;

    // Verify issue belongs to citizen's area
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    if (req.user.role === 'citizen') {
      const userArea = req.user.areaId?._id?.toString() || req.user.areaId?.toString();
      const issueArea = issue.areaId?.toString();
      if (userArea && issueArea && userArea !== issueArea) {
        return res.status(403).json({ success: false, message: 'You can only give feedback for issues in your area' });
      }
    }

    const existing = await Feedback.findOne({ issueId, userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted feedback for this issue' });
    }

    const feedback = await Feedback.create({
      issueId,
      userId: req.user._id,
      rating,
      workStatus,
      comment,
      officerId: issue.assignedTo,
      areaId: issue.areaId
    });

    // Update officer's feedback score in ranking
    if (issue.assignedTo) {
      const allFeedback = await Feedback.find({ officerId: issue.assignedTo });
      const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;

      await Ranking.findOneAndUpdate(
        { officerId: issue.assignedTo },
        {
          feedbackScore: Math.round(avgRating * 10) / 10,
          $set: {
            overallScore: 0 // will be recalculated
          }
        }
      );

      // Recalculate overall score
      const ranking = await Ranking.findOne({ officerId: issue.assignedTo });
      if (ranking) {
        ranking.overallScore = Math.round(
          (ranking.completionScore * 0.5) + (avgRating * 10 * 0.5)
        );
        if (ranking.overallScore >= 90) ranking.badge = 'platinum';
        else if (ranking.overallScore >= 75) ranking.badge = 'gold';
        else if (ranking.overallScore >= 60) ranking.badge = 'silver';
        else if (ranking.overallScore >= 40) ranking.badge = 'bronze';
        await ranking.save();
      }
    }

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted feedback for this issue' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/feedback/issue/:issueId
const getIssueFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ issueId: req.params.issueId })
      .populate('userId', 'name')
      .sort('-createdAt');
    const avg = feedbacks.reduce((s, f) => s + f.rating, 0) / (feedbacks.length || 1);
    res.json({ success: true, count: feedbacks.length, avgRating: avg.toFixed(1), feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/feedback/officer/:officerId
const getOfficerFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ officerId: req.params.officerId })
      .populate('userId', 'name')
      .populate('issueId', 'title category')
      .sort('-createdAt');
    const avg = feedbacks.reduce((s, f) => s + f.rating, 0) / (feedbacks.length || 1);
    res.json({ success: true, count: feedbacks.length, avgRating: avg.toFixed(1), feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitFeedback, getIssueFeedback, getOfficerFeedback };
