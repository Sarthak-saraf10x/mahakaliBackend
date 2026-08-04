const mongoose = require('mongoose');

const CorporateQuoteSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  companySize: {
    type: String,
    default: '24 Seater'
  },
  destination: {
    type: String,
    default: 'Daily Staff Commute'
  },
  travelDates: {
    type: String
  },
  numberOfEmployees: {
    type: String
  },
  budget: {
    type: String
  },
  requirements: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['New', 'New Request', 'Contacted', 'Quote Sent', 'In Progress', 'Contract Active', 'Archived'],
    default: 'New'
  }
});

module.exports = mongoose.model('CorporateQuote', CorporateQuoteSchema);
