const express = require('express');
const router = express.Router();
const {
  getGallery,
  createGallery,
  updateGallery,
  deleteGallery
} = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getGallery);
// Supports single image ('image'), multiple images ('images'), or URL input
router.post('/', protect, upload.any(), createGallery);
router.post('/upload', protect, upload.any(), createGallery);
router.put('/:id', protect, upload.any(), updateGallery);
router.delete('/:id', protect, deleteGallery);

module.exports = router;
