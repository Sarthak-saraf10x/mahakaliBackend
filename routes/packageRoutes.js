const express = require('express');
const router = express.Router();
const {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
} = require('../controllers/packageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Safe upload middleware wrapper
const safeUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Package Upload Warning:', err.message);
    }
    next();
  });
};

router.get('/', getPackages);
router.get('/:id', getPackageById);
router.post('/', protect, safeUpload, createPackage);
router.put('/:id', protect, safeUpload, updatePackage);
router.delete('/:id', protect, deletePackage);

module.exports = router;
