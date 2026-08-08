const express = require('express');
const router = express.Router();
const { getSettings, updateSetting } = require('../controllers/settingController');
const { protect } = require('../middleware/auth');

router.get('/', getSettings);
router.post('/', protect, updateSetting);

module.exports = router;
