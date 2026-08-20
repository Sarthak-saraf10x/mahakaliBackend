const express = require('express');
const router = express.Router();
const { googleAuth, emailAuth, getProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/google', googleAuth);
router.post('/login', emailAuth);
router.post('/email', emailAuth);
router.get('/profile', protect, getProfile);
router.post('/logout', logout);


module.exports = router;
