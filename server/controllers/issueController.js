const Issue = require('../models/Issue');
const Area = require('../models/Area');
const Ranking = require('../models/Ranking');

// @GET /api/issues
const getIssues = async (req, res) => {
  try {
    const { areaId, status, category, priority, assignedTo, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Area-based filtering
    if (req.user.role === 'citizen' || req.user.role === 'officer') {
      const userAreaId = req.user.areaId?._id || req.user.areaId;
      if (userAreaId) filter.areaId = userAreaId;
    } else if (areaId) {
      filter.areaId = areaId;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const skip = (page - 1) * limit;
    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email designation')
      .populate('areaId', 'name district')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: issues.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      issues
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/issues/:id
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email designation')
      .populate('areaId', 'name district state')
      .populate('workNotes.addedBy', 'name role');
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    res.json({ success: true, issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/issues — Citizen
const createIssue = async (req, res) => {
  try {
    const { title, description, category, priority, areaId, location, deadline } = req.body;

    // Validate citizen's area
    if (req.user.role === 'citizen') {
      const userAreaId = req.user.areaId?._id?.toString() || req.user.areaId?.toString();
      if (userAreaId && areaId !== userAreaId) {
        return res.status(403).json({ success: false, message: 'You can only post issues in your registered area' });
      }
    }

    // Find assigned officer for the area
    const area = await Area.findById(areaId || req.user.areaId);
    const assignedTo = area?.assignedOfficerId || null;

    const issue = await Issue.create({
      title, description, category, priority,
      areaId: areaId || req.user.areaId,
      reportedBy: req.user._id,
      assignedTo,
      location,
      deadline,
      status: assignedTo ? 'assigned' : 'open'
    });

    // Update officer ranking counters
    if (assignedTo) {
      await Ranking.findOneAndUpdate(
        { officerId: assignedTo },
        { $inc: { totalAssigned: 1, pendingCount: 1 } },
        { upsert: true }
      );
    }

    const populated = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email designation')
      .populate('areaId', 'name district');

    res.status(201).json({ success: true, issue: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/issues/:id/status — Officer
const updateIssueStatus = async (req, res) => {
  try {
    const { status, workNote } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    // Officer can only update issues in their area
    if (req.user.role === 'officer') {
      const officerAreaId = req.user.areaId?._id?.toString() || req.user.areaId?.toString();
      const issueAreaId = issue.areaId?.toString();
      if (officerAreaId && issueAreaId && officerAreaId !== issueAreaId) {
        return res.status(403).json({ success: false, message: 'This issue is not in your area' });
      }
    }

    const oldStatus = issue.status;
    issue.status = status;
    if (status === 'resolved' && !issue.resolvedAt) {
      issue.resolvedAt = new Date();
    }
    if (workNote) {
      issue.workNotes.push({ note: workNote, addedBy: req.user._id });
    }
    await issue.save();

    // Update ranking when resolved
    if (status === 'resolved' && oldStatus !== 'resolved' && issue.assignedTo) {
      const resolutionDays = issue.resolvedAt
        ? Math.ceil((issue.resolvedAt - issue.createdAt) / (1000 * 60 * 60 * 24))
        : 0;
      await updateOfficerRanking(issue.assignedTo, resolutionDays);
    }

    res.json({ success: true, issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/issues/:id/assign — Admin/Authority
const assignIssue = async (req, res) => {
  try {
    const { officerId, deadline } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { assignedTo: officerId, status: 'assigned', deadline },
      { new: true }
    ).populate('assignedTo', 'name email designation');
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    await Ranking.findOneAndUpdate(
      { officerId },
      { $inc: { totalAssigned: 1, pendingCount: 1 } },
      { upsert: true }
    );
    res.json({ success: true, issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/issues/:id — Admin only
const deleteIssue = async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/issues/stats
const getIssueStats = async (req, res) => {
  try {
    const areaFilter = {};
    if (req.user.role === 'citizen' || req.user.role === 'officer') {
      areaFilter.areaId = req.user.areaId?._id || req.user.areaId;
    }
    const stats = await Issue.aggregate([
      { $match: areaFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const categoryStats = await Issue.aggregate([
      { $match: areaFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, stats, categoryStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper: update officer ranking after resolution
const updateOfficerRanking = async (officerId, resolutionDays) => {
  try {
    const ranking = await Ranking.findOne({ officerId });
    if (!ranking) return;

    ranking.completedCount += 1;
    ranking.pendingCount = Math.max(0, ranking.pendingCount - 1);

    const total = ranking.completedCount;
    ranking.avgResolutionTimeDays = (
      (ranking.avgResolutionTimeDays * (total - 1) + resolutionDays) / total
    );

    const completionRate = ranking.totalAssigned > 0
      ? (ranking.completedCount / ranking.totalAssigned) * 100 : 0;
    const timeScore = Math.max(0, 100 - resolutionDays * 5);
    ranking.completionScore = Math.round((completionRate * 0.6) + (timeScore * 0.4));

    ranking.overallScore = Math.round(
      (ranking.completionScore * 0.5) + (ranking.feedbackScore * 10 * 0.5)
    );

    // Assign badge
    if (ranking.overallScore >= 90) ranking.badge = 'platinum';
    else if (ranking.overallScore >= 75) ranking.badge = 'gold';
    else if (ranking.overallScore >= 60) ranking.badge = 'silver';
    else if (ranking.overallScore >= 40) ranking.badge = 'bronze';
    else ranking.badge = 'none';

    await ranking.save();
  } catch (err) {
    console.error('Ranking update error:', err.message);
  }
};

module.exports = { getIssues, getIssueById, createIssue, updateIssueStatus, assignIssue, deleteIssue, getIssueStats };
