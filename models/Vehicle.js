const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Hatchback', 'Innova', 'Ertiga', 'Tempo Traveller', 'Mini Bus', 'Luxury Bus', 'Other'],
    default: 'Sedan'
  },
  seatingCapacity: {
    type: Number,
    required: true,
    min: 1,
    max: 60,
    default: 4
  },
  fuelType: {
    type: String,
    enum: ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid'],
    default: 'Diesel'
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    default: 'Manual'
  },
  pricePerKm: {
    type: String,
    default: ''
  },
  features: {
    type: [String],
    default: []
  },
  ac: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  whatsappNumber: {
    type: String,
    default: '917517685951'
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'Maintenance'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
