const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Safe upload middleware wrapper (same pattern as busRouteRoutes)
const safeUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Vehicle Upload Warning:', err.message);
    }
    next();
  });
};

router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.post('/', protect, safeUpload, createVehicle);
router.put('/:id', protect, safeUpload, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

module.exports = router;
