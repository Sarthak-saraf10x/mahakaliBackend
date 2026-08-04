const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    default: 'General Enquiry'
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Unread', 'Read', 'Responded'],
    default: 'Unread'
  }
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
