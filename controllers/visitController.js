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

// @desc Get detailed visit analytics graph data (today, 7days, 30days, 12months, all)
// @route GET /api/visits/analytics
// @access Public / Admin
exports.getVisitAnalytics = async (req, res) => {
  try {
    const period = (req.query.period || '7days').toLowerCase();
    const now = new Date();

    let labels = [];
    let counts = [];
    let startDate;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const visits = await Visit.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        }
      ]);
      const hourMap = {};
      visits.forEach(v => { hourMap[v._id] = v.count; });

      for (let h = 0; h <= 23; h++) {
        const hour12 = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
        labels.push(hour12);
        counts.push(hourMap[h] || 0);
      }
    } else if (period === '7days' || period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const visits = await Visit.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        }
      ]);
      const dateMap = {};
      visits.forEach(v => { dateMap[v._id] = v.count; });

      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        labels.push(dayLabel);
        counts.push(dateMap[dateStr] || 0);
      }
    } else if (period === '30days' || period === 'month') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);

      const visits = await Visit.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        }
      ]);
      const dateMap = {};
      visits.forEach(v => { dateMap[v._id] = v.count; });

      for (let i = 0; i < 30; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(dayLabel);
        counts.push(dateMap[dateStr] || 0);
      }
    } else if (period === '12months' || period === 'year') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

      const visits = await Visit.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        }
      ]);
      const monthMap = {};
      visits.forEach(v => { monthMap[v._id] = v.count; });

      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        labels.push(monthLabel);
        counts.push(monthMap[monthStr] || 0);
      }
    } else { // 'all'
      const firstVisit = await Visit.findOne().sort({ createdAt: 1 });
      const start = firstVisit ? new Date(firstVisit.createdAt) : new Date(now.getFullYear(), 0, 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const visits = await Visit.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        }
      ]);
      const monthMap = {};
      visits.forEach(v => { monthMap[v._id] = v.count; });

      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      let iter = new Date(start.getFullYear(), start.getMonth(), 1);
      while (iter <= currentMonth) {
        const monthStr = `${iter.getFullYear()}-${String(iter.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = iter.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        labels.push(monthLabel);
        counts.push(monthMap[monthStr] || 0);
        iter.setMonth(iter.getMonth() + 1);
      }
    }

    const totalVisits = counts.reduce((a, b) => a + b, 0);
    const avgVisits = Math.round(totalVisits / (counts.length || 1));
    const maxVal = Math.max(...counts, 0);
    const minVal = Math.min(...counts, 0);
    const maxIdx = counts.indexOf(maxVal);
    const minIdx = counts.indexOf(minVal);

    const spike = {
      count: maxVal,
      label: maxVal > 0 && maxIdx !== -1 ? labels[maxIdx] : 'N/A'
    };

    const drop = {
      count: minVal,
      label: minIdx !== -1 ? labels[minIdx] : 'N/A'
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        labels,
        counts,
        summary: {
          totalVisits,
          avgVisits,
          spike,
          drop
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
