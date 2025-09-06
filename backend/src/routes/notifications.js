const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getUserNotifications);
router.put('/:notificationId/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:notificationId', deleteNotification);
router.delete('/clear-all', clearAllNotifications);

module.exports = router;
