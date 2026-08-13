const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  path: {
    type: String,
    default: '/'
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Visit', visitSchema);
