const express = require('express');
const router = express.Router();
const { recordVisit, getVisitStats } = require('../controllers/visitController');

router.post('/', recordVisit);
router.get('/stats', getVisitStats);

module.exports = router;
