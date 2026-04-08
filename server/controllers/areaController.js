const Area = require('../models/Area');
const User = require('../models/User');

// @GET /api/areas
const getAreas = async (req, res) => {
  try {
    const areas = await Area.find({ isActive: true })
      .populate('assignedOfficerId', 'name email designation')
      .sort('name');
    res.json({ success: true, count: areas.length, areas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/areas/:id
const getAreaById = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id)
      .populate('assignedOfficerId', 'name email designation phone');
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });
    res.json({ success: true, area });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/areas — Admin
const createArea = async (req, res) => {
  try {
    const area = await Area.create(req.body);
    res.status(201).json({ success: true, area });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/areas/:id — Admin
const updateArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedOfficerId', 'name email designation');
    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });

    // Update officer's areaId if assigned
    if (req.body.assignedOfficerId) {
      await User.findByIdAndUpdate(req.body.assignedOfficerId, { areaId: area._id });
    }
    res.json({ success: true, area });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/areas/:id — Admin
const deleteArea = async (req, res) => {
  try {
    await Area.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Area deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAreas, getAreaById, createArea, updateArea, deleteArea };
