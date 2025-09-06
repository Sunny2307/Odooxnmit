const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { exportUserData, generateReport, getActivityLog } = require('../controllers/profileController');

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

// Export user data
router.get('/export', exportUserData);

// Generate productivity report
router.get('/report', generateReport);

// Get activity log
router.get('/activity', getActivityLog);

module.exports = router;
