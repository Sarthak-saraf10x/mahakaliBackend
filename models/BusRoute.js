const mongoose = require('mongoose');

const BusRouteSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
    trim: true,
    default: 'Nagpur'
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  busType: {
    type: String,
    required: true,
    default: 'AC Sleeper 2+1'
  },
  departureTime: {
    type: String,
    required: true,
    default: '09:00 PM'
  },
  arrivalTime: {
    type: String,
    default: '06:00 AM'
  },
  price: {
    type: Number,
    required: true,
    default: 750
  },
  seatsAvailable: {
    type: Number,
    default: 30
  },
  frequency: {
    type: String,
    default: 'Daily'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  },
  status: {
    type: String,
    enum: ['Active', 'Filling Fast', 'Sold Out', 'Suspended'],
    default: 'Active'
  },
  whatsappNumber: {
    type: String,
    default: '919876543210'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BusRoute', BusRouteSchema);
