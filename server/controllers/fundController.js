const Fund = require('../models/Fund');

// @GET /api/funds
const getFunds = async (req, res) => {
  try {
    const { areaId, status, category, page = 1, limit = 10 } = req.query;
    const filter = { isPublic: true };

    if (req.user.role === 'citizen' || req.user.role === 'officer') {
      filter.areaId = req.user.areaId?._id || req.user.areaId;
    } else if (areaId) {
      filter.areaId = areaId;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const total = await Fund.countDocuments(filter);
    const funds = await Fund.find(filter)
      .populate('areaId', 'name district')
      .populate('allocatedBy', 'name designation')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: funds.length, total, funds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/funds/:id
const getFundById = async (req, res) => {
  try {
    const fund = await Fund.findById(req.params.id)
      .populate('areaId', 'name district state')
      .populate('allocatedBy', 'name designation email')
      .populate('transactions.addedBy', 'name');
    if (!fund) return res.status(404).json({ success: false, message: 'Fund not found' });
    res.json({ success: true, fund });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/funds — Authority/Admin
const allocateFund = async (req, res) => {
  try {
    const { title, purpose, amount, areaId, category, deadline, issueId } = req.body;
    const fund = await Fund.create({
      title, purpose, amount, areaId, category, deadline, issueId,
      allocatedBy: req.user._id,
      status: 'allocated'
    });
    const populated = await Fund.findById(fund._id)
      .populate('areaId', 'name district')
      .populate('allocatedBy', 'name designation');
    res.status(201).json({ success: true, fund: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/funds/:id — Authority/Admin
const updateFund = async (req, res) => {
  try {
    const { status, amountUtilized, completedAt } = req.body;
    const fund = await Fund.findByIdAndUpdate(
      req.params.id,
      { status, amountUtilized, completedAt },
      { new: true, runValidators: true }
    );
    if (!fund) return res.status(404).json({ success: false, message: 'Fund not found' });
    res.json({ success: true, fund });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/funds/:id/transaction — Authority/Admin
const addTransaction = async (req, res) => {
  try {
    const { description, amount } = req.body;
    const fund = await Fund.findById(req.params.id);
    if (!fund) return res.status(404).json({ success: false, message: 'Fund not found' });

    fund.transactions.push({ description, amount, addedBy: req.user._id });
    fund.amountUtilized = (fund.amountUtilized || 0) + Number(amount);
    if (fund.amountUtilized >= fund.amount) fund.status = 'completed';
    else fund.status = 'active';
    await fund.save();
    res.json({ success: true, fund });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/funds/stats
const getFundStats = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'citizen' || req.user.role === 'officer') {
      filter.areaId = req.user.areaId?._id || req.user.areaId;
    }
    const stats = await Fund.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAllocated: { $sum: '$amount' },
          totalUtilized: { $sum: '$amountUtilized' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json({ success: true, stats: stats[0] || { totalAllocated: 0, totalUtilized: 0, count: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFunds, getFundById, allocateFund, updateFund, addTransaction, getFundStats };
