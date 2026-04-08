const Ranking = require('../models/Ranking');
const Issue = require('../models/Issue');
const Feedback = require('../models/Feedback');
const Fund = require('../models/Fund');

// @GET /api/rankings
const getRankings = async (req, res) => {
  try {
    const { areaId } = req.query;
    const filter = {};
    if (areaId) filter.areaId = areaId;

    const rankings = await Ranking.find(filter)
      .populate('officerId', 'name email designation avatar')
      .populate('areaId', 'name district')
      .sort('-overallScore');

    // Assign rank numbers
    const ranked = rankings.map((r, i) => ({ ...r.toJSON(), rank: i + 1 }));
    res.json({ success: true, count: ranked.length, rankings: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/rankings/officer/:officerId
const getOfficerRanking = async (req, res) => {
  try {
    const ranking = await Ranking.findOne({ officerId: req.params.officerId })
      .populate('officerId', 'name email designation avatar')
      .populate('areaId', 'name district');
    if (!ranking) return res.status(404).json({ success: false, message: 'Ranking not found' });
    res.json({ success: true, ranking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/rankings/analytics — Authority/Admin
const getAnalytics = async (req, res) => {
  try {
    const { areaId } = req.query;
    const areaFilter = areaId ? { areaId } : {};

    // Issue stats by area
    const issueByArea = await Issue.aggregate([
      { $group: { _id: { area: '$areaId', status: '$status' }, count: { $sum: 1 } } }
    ]);

    // Fund stats by area
    const fundByArea = await Fund.aggregate([
      {
        $group: {
          _id: '$areaId',
          totalAmount: { $sum: '$amount' },
          totalUtilized: { $sum: '$amountUtilized' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Overall stats
    const totalIssues = await Issue.countDocuments(areaFilter);
    const resolvedIssues = await Issue.countDocuments({ ...areaFilter, status: 'resolved' });
    const overdueIssues = await Issue.countDocuments({ ...areaFilter, status: 'overdue' });
    const totalFunds = await Fund.aggregate([{ $match: areaFilter }, { $group: { _id: null, total: { $sum: '$amount' }, utilized: { $sum: '$amountUtilized' } } }]);
    const avgFeedback = await Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);

    res.json({
      success: true,
      overview: {
        totalIssues,
        resolvedIssues,
        overdueIssues,
        resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0,
        totalFundsAllocated: totalFunds[0]?.total || 0,
        totalFundsUtilized: totalFunds[0]?.utilized || 0,
        avgCitizenRating: avgFeedback[0]?.avg?.toFixed(1) || '0.0'
      },
      issueByArea,
      fundByArea
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRankings, getOfficerRanking, getAnalytics };
