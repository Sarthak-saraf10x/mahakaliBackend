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

// Safe upload middleware wrapper
const safeUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Upload Middleware Error:', err.message);
      return res.status(400).json({
        success: false,
        message: `Upload Error: ${err.message}. Please check your Cloudinary CLOUDINARY_CLOUD_NAME in .env or Render dashboard.`
      });
    }
    next();
  });
};

router.get('/', getGallery);
// Supports single image ('image'), multiple images ('images'), or URL input
router.post('/', protect, safeUpload, createGallery);
router.post('/upload', protect, safeUpload, createGallery);
router.put('/:id', protect, safeUpload, updateGallery);
router.delete('/:id', protect, deleteGallery);

module.exports = router;
