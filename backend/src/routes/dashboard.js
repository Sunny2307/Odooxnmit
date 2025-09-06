const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getDashboardStats, getProductivityInsights } = require('../controllers/dashboardController');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get productivity insights
router.get('/insights', getProductivityInsights);

module.exports = router;
