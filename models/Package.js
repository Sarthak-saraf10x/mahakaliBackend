const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  highlights: {
    type: [String],
    default: []
  },
  inclusions: {
    type: [String],
    default: []
  },
  exclusions: {
    type: [String],
    default: []
  },
  image: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5
  },
  featured: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['Hill Station', 'Beach', 'Heritage', 'Adventure', 'Pilgrimage', 'Custom'],
    default: 'Hill Station'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Package', PackageSchema);
