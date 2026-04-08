const User = require('../models/User');
const Ranking = require('../models/Ranking');

// @GET /api/users — Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, areaId, isApproved } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (areaId) filter.areaId = areaId;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const users = await User.find(filter).populate('areaId', 'name district state').sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('areaId', 'name district state');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/users/:id/approve — Admin
const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true })
      .populate('areaId', 'name district state');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Create ranking for officer if approved
    if (user.role === 'officer') {
      const existing = await Ranking.findOne({ officerId: user._id });
      if (!existing && user.areaId) {
        await Ranking.create({ officerId: user._id, areaId: user.areaId });
      }
    }
    res.json({ success: true, message: 'User approved successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/users/:id/role — Admin
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true })
      .populate('areaId', 'name district state');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/users/:id/deactivate — Admin
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deactivated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/users/stats — Admin
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const total = await User.countDocuments();
    const pending = await User.countDocuments({ isApproved: false });
    res.json({ success: true, stats, total, pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllUsers, getUserById, approveUser, changeUserRole, deactivateUser, getUserStats };
