const { validationResult } = require('express-validator');
const { prisma } = require('../utils/db');

// Create new task
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { projectId } = req.params;
    const { title, description, assigneeId, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create notification for assignee if assigned
    if (assigneeId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          content: `You have been assigned a new task: "${title}" in project "${task.project.name}"`
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

// Get all tasks for a project
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group tasks by status
    const tasksByStatus = {
      'To-Do': tasks.filter(task => task.status === 'To-Do'),
      'In Progress': tasks.filter(task => task.status === 'In Progress'),
      'Done': tasks.filter(task => task.status === 'Done')
    };

    res.status(200).json({
      success: true,
      tasks,
      tasksByStatus
    });

  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
};

// Get task by ID
const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      task
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { taskId } = req.params;
    const { title, description, assigneeId, dueDate, status } = req.body;

    // Get current task to check for changes
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || currentTask.status
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create notifications for changes
    if (assigneeId && assigneeId !== currentTask.assigneeId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          content: `You have been assigned a task: "${title}"`
        }
      });
    }

    if (status && status !== currentTask.status) {
      const statusMessage = `Task "${title}" status changed to "${status}"`;
      
      // Notify assignee
      if (task.assigneeId) {
        await prisma.notification.create({
          data: {
            userId: task.assigneeId,
            content: statusMessage
          }
        });
      }

      // Notify project members
      const projectMembers = await prisma.projectMember.findMany({
        where: { projectId: task.projectId },
        select: { userId: true }
      });

      for (const member of projectMembers) {
        if (member.userId !== task.assigneeId) {
          await prisma.notification.create({
            data: {
              userId: member.userId,
              content: statusMessage
            }
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};

// Get user's assigned tasks
const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      tasks
    });

  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user tasks'
    });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  getUserTasks
};
