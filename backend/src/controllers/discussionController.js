const { validationResult } = require('express-validator');
const { prisma } = require('../utils/db');

// Create new message
const createMessage = async (req, res) => {
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
    const { content, parentId } = req.body;
    const userId = req.user.id;

    const message = await prisma.message.create({
      data: {
        projectId,
        userId,
        content,
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    // Create notifications for project members (except the sender)
    const projectMembers = await prisma.projectMember.findMany({
      where: { 
        projectId: projectId,
        userId: { not: userId }
      },
      select: { userId: true }
    });

    for (const member of projectMembers) {
      await prisma.notification.create({
        data: {
          userId: member.userId,
          content: `New message in project discussion: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message created successfully',
      message
    });

  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create message'
    });
  }
};

// Get project messages
const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await prisma.message.findMany({
      where: { 
        projectId: projectId,
        parentId: null // Only top-level messages
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('Get project messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get message by ID
const getMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
};

// Update message
const updateMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Check if user owns the message
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        userId: userId
      }
    });

    if (!existingMessage) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    const message = await prisma.message.update({
      where: { id: messageId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      message
    });

  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Check if user owns the message
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        userId: userId
      }
    });

    if (!existingMessage) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

module.exports = {
  createMessage,
  getProjectMessages,
  getMessage,
  updateMessage,
  deleteMessage
};
