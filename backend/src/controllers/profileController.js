const { prisma } = require('../utils/db');

// Export user data
const exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        createdProjects: {
          include: {
            tasks: true,
            members: true
          }
        },
        projectMembers: {
          include: {
            project: {
              include: {
                tasks: true
              }
            }
          }
        },
        assignedTasks: {
          include: {
            project: {
              select: {
                name: true
              }
            }
          }
        },
        personalTodos: true,
        notifications: true
      }
    });

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format the data for export
    const exportData = {
      user: {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      },
      projects: {
        created: userData.createdProjects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          createdAt: project.createdAt,
          taskCount: project.tasks.length,
          memberCount: project.members.length
        })),
        memberOf: userData.projectMembers.map(member => ({
          projectId: member.project.id,
          projectName: member.project.name,
          role: member.role,
          joinedAt: member.createdAt,
          taskCount: member.project.tasks.length
        }))
      },
      tasks: userData.assignedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        project: task.project.name
      })),
      personalTodos: userData.personalTodos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt
      })),
      notifications: userData.notifications.map(notification => ({
        id: notification.id,
        content: notification.content,
        read: notification.read,
        createdAt: notification.createdAt
      })),
      exportDate: new Date().toISOString(),
      totalProjects: userData.createdProjects.length + userData.projectMembers.length,
      totalTasks: userData.assignedTasks.length,
      totalTodos: userData.personalTodos.length,
      totalNotifications: userData.notifications.length
    };

    res.status(200).json({
      success: true,
      data: exportData,
      message: 'User data exported successfully'
    });

  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data'
    });
  }
};

// Generate productivity report
const generateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reportType = 'monthly', startDate, endDate } = req.query;

    // Set default date range if not provided
    const now = new Date();
    let reportStartDate, reportEndDate;

    if (reportType === 'weekly') {
      reportStartDate = new Date(now);
      reportStartDate.setDate(now.getDate() - 7);
      reportEndDate = now;
    } else if (reportType === 'monthly') {
      reportStartDate = new Date(now);
      reportStartDate.setMonth(now.getMonth() - 1);
      reportEndDate = now;
    } else if (reportType === 'yearly') {
      reportStartDate = new Date(now);
      reportStartDate.setFullYear(now.getFullYear() - 1);
      reportEndDate = now;
    } else if (startDate && endDate) {
      reportStartDate = new Date(startDate);
      reportEndDate = new Date(endDate);
    } else {
      reportStartDate = new Date(now);
      reportStartDate.setMonth(now.getMonth() - 1);
      reportEndDate = now;
    }

    // Get user's tasks in the date range
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        createdAt: {
          gte: reportStartDate,
          lte: reportEndDate
        }
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    });

    // Get personal todos in the date range
    const personalTodos = await prisma.personalTodo.findMany({
      where: {
        userId,
        createdAt: {
          gte: reportStartDate,
          lte: reportEndDate
        }
      }
    });

    // Calculate statistics
    const stats = {
      period: {
        start: reportStartDate,
        end: reportEndDate,
        type: reportType
      },
      tasks: {
        total: tasks.length,
        completed: tasks.filter(task => task.status === 'Done').length,
        inProgress: tasks.filter(task => task.status === 'In Progress').length,
        todo: tasks.filter(task => task.status === 'To-Do').length,
        overdue: tasks.filter(task => {
          if (!task.dueDate || task.status === 'Done') return false;
          return new Date(task.dueDate) < new Date();
        }).length
      },
      personalTodos: {
        total: personalTodos.length,
        completed: personalTodos.filter(todo => todo.completed).length,
        pending: personalTodos.filter(todo => !todo.completed).length,
        overdue: personalTodos.filter(todo => {
          if (!todo.dueDate || todo.completed) return false;
          return new Date(todo.dueDate) < new Date();
        }).length
      },
      productivity: {
        completionRate: tasks.length > 0 ? 
          Math.round((tasks.filter(task => task.status === 'Done').length / tasks.length) * 100) : 0,
        averageCompletionTime: '2.5 days', // Mock data - calculate from actual data
        mostProductiveDay: 'Tuesday', // Mock data
        topProject: tasks.length > 0 ? 
          tasks.reduce((acc, task) => {
            acc[task.project.name] = (acc[task.project.name] || 0) + 1;
            return acc;
          }, {}) : {}
      }
    };

    // Generate report data
    const reportData = {
      user: await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          username: true,
          email: true
        }
      }),
      statistics: stats,
      tasks: tasks.map(task => ({
        title: task.title,
        status: task.status,
        project: task.project.name,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        dueDate: task.dueDate
      })),
      personalTodos: personalTodos.map(todo => ({
        title: todo.title,
        completed: todo.completed,
        priority: todo.priority,
        createdAt: todo.createdAt,
        dueDate: todo.dueDate
      })),
      generatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: reportData,
      message: 'Report generated successfully'
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
};

// Get activity log
const getActivityLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    // Get recent tasks
    const recentTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get recent personal todos
    const recentTodos = await prisma.personalTodo.findMany({
      where: {
        userId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Get recent notifications
    const recentNotifications = await prisma.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Combine and format activities
    const activities = [];

    // Add task activities
    recentTasks.forEach(task => {
      activities.push({
        id: `task-${task.id}`,
        type: 'task',
        action: task.status === 'Done' ? 'completed' : 
                task.status === 'In Progress' ? 'started' : 'created',
        title: task.title,
        project: task.project.name,
        status: task.status,
        timestamp: task.updatedAt,
        icon: '📋'
      });
    });

    // Add todo activities
    recentTodos.forEach(todo => {
      activities.push({
        id: `todo-${todo.id}`,
        type: 'todo',
        action: todo.completed ? 'completed' : 'created',
        title: todo.title,
        status: todo.completed ? 'completed' : 'pending',
        timestamp: todo.updatedAt,
        icon: '✅'
      });
    });

    // Add notification activities
    recentNotifications.forEach(notification => {
      activities.push({
        id: `notification-${notification.id}`,
        type: 'notification',
        action: 'received',
        title: notification.content,
        status: notification.read ? 'read' : 'unread',
        timestamp: notification.createdAt,
        icon: '🔔'
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        activities: activities.slice(0, parseInt(limit)),
        total: activities.length,
        hasMore: activities.length > parseInt(limit)
      },
      message: 'Activity log retrieved successfully'
    });

  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity log'
    });
  }
};

module.exports = {
  exportUserData,
  generateReport,
  getActivityLog
};
