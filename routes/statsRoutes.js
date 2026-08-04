const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardStats);

module.exports = router;
