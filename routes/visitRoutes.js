const express = require('express');
const router = express.Router();
const { recordVisit, getVisitStats, getVisitAnalytics } = require('../controllers/visitController');

router.post('/', recordVisit);
router.get('/stats', getVisitStats);
router.get('/analytics', getVisitAnalytics);

module.exports = router;
