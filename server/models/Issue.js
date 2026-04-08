const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['road', 'water', 'electricity', 'sanitation', 'health', 'education', 'safety', 'environment', 'infrastructure', 'other']
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in-progress', 'resolved', 'overdue', 'rejected'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  images: [{ type: String }],
  location: {
    landmark: { type: String },
    coordinates: { lat: Number, lng: Number }
  },
  deadline: { type: Date },
  resolvedAt: { type: Date },
  workNotes: [{ 
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  isPublic: { type: Boolean, default: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Auto-detect overdue
issueSchema.pre('save', function(next) {
  if (this.deadline && new Date() > this.deadline && 
      !['resolved', 'rejected'].includes(this.status)) {
    this.status = 'overdue';
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
