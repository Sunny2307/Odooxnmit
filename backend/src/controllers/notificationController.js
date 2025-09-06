const { prisma } = require('../utils/db');

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const skip = (page - 1) * limit;
    const whereClause = { userId };
    
    if (unreadOnly === 'true') {
      whereClause.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const totalCount = await prisma.notification.count({
      where: whereClause
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId
      },
      data: {
        read: true
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId: userId,
        read: false
      },
      data: {
        read: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: userId
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// Clear all notifications
const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.deleteMany({
      where: {
        userId: userId
      }
    });

    res.status(200).json({
      success: true,
      message: 'All notifications cleared'
    });

  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear all notifications'
    });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
