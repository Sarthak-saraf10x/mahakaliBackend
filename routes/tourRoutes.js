const express = require('express');
const router = express.Router();
const {
  getTours,
  createTour,
  updateTour,
  deleteTour
} = require('../controllers/tourController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getTours);
router.post('/', protect, upload.single('image'), createTour);
router.put('/:id', protect, upload.single('image'), updateTour);
router.delete('/:id', protect, deleteTour);

module.exports = router;
