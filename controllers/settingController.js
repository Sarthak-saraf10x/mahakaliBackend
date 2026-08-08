const Setting = require('../models/Setting');

// @desc Get all settings
// @route GET /api/settings
// @access Public
exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    res.status(200).json({ success: true, data: settingsMap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update or create setting
// @route POST /api/settings
// @access Private (Admin)
exports.updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, message: 'Setting key is required' });
    }

    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
