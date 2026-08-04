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
// Supports both single image ('image') and array of images ('images')
router.post('/', protect, upload.array('images', 10), createGallery);
router.put('/:id', protect, upload.single('image'), updateGallery);
router.delete('/:id', protect, deleteGallery);

module.exports = router;
