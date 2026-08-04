const mongoose = require('mongoose');

const UpcomingTourSchema = new mongoose.Schema({
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
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seatsAvailable: {
    type: Number,
    required: true,
    default: 20
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Filling Fast', 'Sold Out', 'Completed'],
    default: 'Upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UpcomingTour', UpcomingTourSchema);
