const Visit = require('../models/Visit');

// @desc Record a website visit
// @route POST /api/visits
// @access Public
exports.recordVisit = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
    const userAgent = req.headers['user-agent'] || '';
    const visitPath = req.body?.path || '/';

    await Visit.create({
      ip: String(ip).split(',')[0].trim(),
      userAgent: String(userAgent),
      path: String(visitPath)
    });

    res.status(201).json({ success: true, message: 'Visit logged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get visit statistics filtered by week, month, year, or all-time
// @route GET /api/visits/stats
// @access Public / Admin
exports.getVisitStats = async (req, res) => {
  try {
    const { period } = req.query; // 'week' | 'month' | 'year' | 'today' | 'all'
    const now = new Date();

    // Start of Today (00:00:00)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 7 Days ago for Week
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 30 Days ago for Month
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 365 Days ago for Year
    const yearStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const [total, today, week, month, year] = await Promise.all([
      Visit.countDocuments({}),
      Visit.countDocuments({ createdAt: { $gte: todayStart } }),
      Visit.countDocuments({ createdAt: { $gte: weekStart } }),
      Visit.countDocuments({ createdAt: { $gte: monthStart } }),
      Visit.countDocuments({ createdAt: { $gte: yearStart } })
    ]);

    let selectedCount = total;
    const selectedPeriod = (period || 'week').toLowerCase();

    if (selectedPeriod === 'today') selectedCount = today;
    else if (selectedPeriod === 'week') selectedCount = week;
    else if (selectedPeriod === 'month') selectedCount = month;
    else if (selectedPeriod === 'year') selectedCount = year;
    else if (selectedPeriod === 'all') selectedCount = total;

    res.status(200).json({
      success: true,
      data: {
        total,
        today,
        week,
        month,
        year,
        selectedPeriod,
        selectedCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
