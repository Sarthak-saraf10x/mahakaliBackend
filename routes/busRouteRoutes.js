const express = require('express');
const router = express.Router();
const {
  getBusRoutes,
  getBusRouteById,
  createBusRoute,
  updateBusRoute,
  deleteBusRoute
} = require('../controllers/busRouteController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Safe upload middleware wrapper
const safeUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Bus Route Upload Warning:', err.message);
    }
    next();
  });
};

router.get('/', getBusRoutes);
router.get('/:id', getBusRouteById);
router.post('/', protect, safeUpload, createBusRoute);
router.put('/:id', protect, safeUpload, updateBusRoute);
router.delete('/:id', protect, deleteBusRoute);

module.exports = router;
