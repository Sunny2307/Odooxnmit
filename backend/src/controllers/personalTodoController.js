const { validationResult } = require('express-validator');
const { prisma } = require('../utils/db');

// Create new personal todo
const createPersonalTodo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, priority, dueDate } = req.body;
    const userId = req.user.id;

    const personalTodo = await prisma.personalTodo.create({
      data: {
        userId,
        title,
        description,
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Personal todo created successfully',
      personalTodo
    });

  } catch (error) {
    console.error('Create personal todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create personal todo'
    });
  }
};

// Get user's personal todos
const getPersonalTodos = async (req, res) => {
  try {
    const userId = req.user.id;

    const personalTodos = await prisma.personalTodo.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      personalTodos
    });

  } catch (error) {
    console.error('Get personal todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personal todos'
    });
  }
};

// Get personal todo by ID
const getPersonalTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const personalTodo = await prisma.personalTodo.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    if (!personalTodo) {
      return res.status(404).json({
        success: false,
        message: 'Personal todo not found'
      });
    }

    res.status(200).json({
      success: true,
      personalTodo
    });

  } catch (error) {
    console.error('Get personal todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personal todo'
    });
  }
};

// Update personal todo
const updatePersonalTodo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, description, completed, priority, dueDate } = req.body;
    const userId = req.user.id;

    // Check if personal todo exists and belongs to user
    const existingTodo = await prisma.personalTodo.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        message: 'Personal todo not found'
      });
    }

    const personalTodo = await prisma.personalTodo.update({
      where: { id },
      data: {
        title,
        description,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Personal todo updated successfully',
      personalTodo
    });

  } catch (error) {
    console.error('Update personal todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update personal todo'
    });
  }
};

// Delete personal todo
const deletePersonalTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if personal todo exists and belongs to user
    const existingTodo = await prisma.personalTodo.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        message: 'Personal todo not found'
      });
    }

    await prisma.personalTodo.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Personal todo deleted successfully'
    });

  } catch (error) {
    console.error('Delete personal todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete personal todo'
    });
  }
};

// Toggle todo completion status
const togglePersonalTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingTodo = await prisma.personalTodo.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        message: 'Personal todo not found'
      });
    }

    const personalTodo = await prisma.personalTodo.update({
      where: { id },
      data: {
        completed: !existingTodo.completed
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Personal todo status updated successfully',
      personalTodo
    });

  } catch (error) {
    console.error('Toggle personal todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update personal todo status'
    });
  }
};

module.exports = {
  createPersonalTodo,
  getPersonalTodos,
  getPersonalTodo,
  updatePersonalTodo,
  deletePersonalTodo,
  togglePersonalTodo
};
