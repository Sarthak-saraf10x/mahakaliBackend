const express = require('express');
const router = express.Router();
const {
  submitContact,
  getContactMessages,
  updateContactStatus,
  deleteContactMessage
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/', protect, getContactMessages);
router.patch('/:id', protect, updateContactStatus);
router.delete('/:id', protect, deleteContactMessage);

module.exports = router;
