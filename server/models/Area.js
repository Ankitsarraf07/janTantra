const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Area name is required'],
    trim: true,
    unique: true
  },
  district: { type: String, required: true },
  state: { type: String, required: true, default: 'Unknown' },
  pincode: { type: String, required: true },
  population: { type: Number, default: 0 },
  assignedOfficerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  description: { type: String },
  boundaries: { type: String }, // GeoJSON or text description
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Area', areaSchema);
