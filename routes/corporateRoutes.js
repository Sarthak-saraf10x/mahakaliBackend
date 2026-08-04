const express = require('express');
const router = express.Router();
const {
  submitCorporateQuote,
  getCorporateQuotes,
  updateCorporateStatus,
  deleteCorporateQuote
} = require('../controllers/corporateController');
const { protect } = require('../middleware/auth');

router.post('/', submitCorporateQuote);
router.get('/', protect, getCorporateQuotes);
router.patch('/:id', protect, updateCorporateStatus);
router.delete('/:id', protect, deleteCorporateQuote);

module.exports = router;
