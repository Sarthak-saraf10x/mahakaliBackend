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

router.get('/', getPackages);
router.get('/:id', getPackageById);
router.post('/', protect, upload.single('image'), createPackage);
router.put('/:id', protect, upload.single('image'), updatePackage);
router.delete('/:id', protect, deletePackage);

module.exports = router;
