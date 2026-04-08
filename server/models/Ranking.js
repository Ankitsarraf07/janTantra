const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: true
  },
  // Performance metrics
  completedCount: { type: Number, default: 0 },
  pendingCount: { type: Number, default: 0 },
  overdueCount: { type: Number, default: 0 },
  totalAssigned: { type: Number, default: 0 },
  avgResolutionTimeDays: { type: Number, default: 0 },
  // Scores
  completionScore: { type: Number, default: 0, min: 0, max: 100 },
  feedbackScore: { type: Number, default: 0, min: 0, max: 5 },
  overallScore: { type: Number, default: 0, min: 0, max: 100 },
  rank: { type: Number, default: 0 },
  // Fund management
  fundUtilizationScore: { type: Number, default: 0, min: 0, max: 100 },
  // Badge earned
  badge: {
    type: String,
    enum: ['none', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'none'
  }
}, { timestamps: true });

module.exports = mongoose.model('Ranking', rankingSchema);
