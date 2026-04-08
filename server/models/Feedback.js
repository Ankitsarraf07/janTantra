const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  workStatus: {
    type: String,
    required: true,
    enum: ['not_started', 'in_progress', 'completed', 'poor_quality']
  },
  comment: {
    type: String,
    maxlength: 500
  },
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area'
  }
}, { timestamps: true });

// Unique feedback per user per issue
feedbackSchema.index({ issueId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
