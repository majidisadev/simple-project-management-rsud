const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Report', reportSchema);

