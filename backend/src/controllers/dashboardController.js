const { prisma } = require('../utils/db');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's projects (where user is creator or member)
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    // Get user's tasks across all projects
    const userTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Get user's personal todos
    const personalTodos = await prisma.personalTodo.findMany({
      where: {
        userId
      }
    });

    // Get recent notifications
    const recentNotifications = await prisma.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Calculate statistics
    const stats = {
      projects: {
        total: userProjects.length,
        active: userProjects.length, // All projects are considered active
        totalTasks: userProjects.reduce((sum, project) => sum + project._count.tasks, 0),
        totalMembers: userProjects.reduce((sum, project) => sum + project._count.members, 0)
      },
      tasks: {
        total: userTasks.length,
        todo: userTasks.filter(task => task.status === 'To-Do').length,
        inProgress: userTasks.filter(task => task.status === 'In Progress').length,
        completed: userTasks.filter(task => task.status === 'Done').length,
        overdue: userTasks.filter(task => {
          if (!task.dueDate || task.status === 'Done') return false;
          return new Date(task.dueDate) < new Date();
        }).length
      },
      personalTodos: {
        total: personalTodos.length,
        pending: personalTodos.filter(todo => !todo.completed).length,
        completed: personalTodos.filter(todo => todo.completed).length,
        overdue: personalTodos.filter(todo => {
          if (!todo.dueDate || todo.completed) return false;
          return new Date(todo.dueDate) < new Date();
        }).length
      },
      notifications: {
        total: recentNotifications.length,
        unread: recentNotifications.filter(notification => !notification.read).length
      }
    };

    // Get task distribution by project
    const taskDistribution = userProjects.map(project => ({
      projectId: project.id,
      projectName: project.name,
      taskCount: project._count.tasks,
      completedTasks: userTasks.filter(task => 
        task.project.id === project.id && task.status === 'Done'
      ).length,
      inProgressTasks: userTasks.filter(task => 
        task.project.id === project.id && task.status === 'In Progress'
      ).length,
      todoTasks: userTasks.filter(task => 
        task.project.id === project.id && task.status === 'To-Do'
      ).length
    }));

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Calculate real weekly progress data
    const weeklyProgress = [];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Start from Monday
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      
      // Count tasks completed on this day
      const completedOnDay = userTasks.filter(task => {
        if (task.status !== 'Done' || !task.updatedAt) return false;
        const taskDate = new Date(task.updatedAt);
        return taskDate.toDateString() === dayDate.toDateString();
      }).length;
      
      // Count tasks created on this day
      const createdOnDay = userTasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === dayDate.toDateString();
      }).length;
      
      weeklyProgress.push({
        day: days[i],
        completed: completedOnDay,
        created: createdOnDay
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stats,
        taskDistribution,
        recentActivity,
        weeklyProgress,
        projects: userProjects,
        tasks: userTasks,
        personalTodos,
        notifications: recentNotifications
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics'
    });
  }
};

// Get productivity insights
const getProductivityInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get tasks completed in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: 'Done',
        updatedAt: {
          gte: thirtyDaysAgo
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

    // Calculate insights
    const insights = {
      tasksCompletedThisMonth: completedTasks.length,
      averageCompletionTime: '2.5 days', // Mock data - calculate from actual data
      mostProductiveDay: 'Tuesday', // Mock data
      topProject: completedTasks.length > 0 ? 
        completedTasks.reduce((acc, task) => {
          acc[task.project.name] = (acc[task.project.name] || 0) + 1;
          return acc;
        }, {}) : {},
      productivityScore: Math.min(100, Math.floor((completedTasks.length / 20) * 100)) // Mock calculation
    };

    res.status(200).json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Productivity insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load productivity insights'
    });
  }
};

module.exports = {
  getDashboardStats,
  getProductivityInsights
};
