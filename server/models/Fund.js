const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Fund title is required'],
    trim: true,
    maxlength: 200
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    maxlength: 1000
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  amountUtilized: { type: Number, default: 0 },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: true
  },
  allocatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['infrastructure', 'health', 'education', 'sanitation', 'water', 'electricity', 'environment', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['allocated', 'active', 'completed', 'overdue', 'cancelled'],
    default: 'allocated'
  },
  deadline: {
    type: Date,
    required: true
  },
  completedAt: { type: Date },
  transactions: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiptUrl: { type: String }
  }],
  documents: [{ type: String }],
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }, // optional linked issue
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

fundSchema.virtual('utilizationPercent').get(function() {
  if (this.amount === 0) return 0;
  return Math.round((this.amountUtilized / this.amount) * 100);
});

fundSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Fund', fundSchema);
