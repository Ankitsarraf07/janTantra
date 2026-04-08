const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Ranking = require('../models/Ranking');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, age, role, areaId, phone, designation, employeeId } = req.body;

    if (!name || !email || !password || !age) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    if (age < 18) {
      return res.status(400).json({ success: false, message: 'You must be at least 18 years old to register' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const userRole = role || 'citizen';
    const isApproved = userRole === 'citizen' || userRole === 'admin' ? true : false;

    const user = await User.create({
      name, email, password, age, role: userRole, areaId, phone,
      designation, employeeId, isApproved
    });

    // Create ranking entry for officers
    if (userRole === 'officer' && areaId) {
      await Ranking.create({ officerId: user._id, areaId });
    }

    const token = generateToken(user._id);
    const populatedUser = await User.findById(user._id).populate('areaId', 'name district state');

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        age: populatedUser.age,
        areaId: populatedUser.areaId,
        isApproved: populatedUser.isApproved,
        phone: populatedUser.phone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password').populate('areaId', 'name district state');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        areaId: user.areaId,
        isApproved: user.isApproved,
        phone: user.phone,
        designation: user.designation
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('areaId', 'name district state pincode');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).populate('areaId', 'name district state');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
