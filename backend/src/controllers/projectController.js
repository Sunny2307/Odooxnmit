const { validationResult } = require('express-validator');
const { prisma } = require('../utils/db');

// Create new project
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description } = req.body;
    const userId = req.user.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdBy: userId,
        members: {
          create: {
            userId: userId,
            role: 'admin'
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            messages: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

// Get all projects for user
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      projects
    });

  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// Get project by ID
const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        messages: {
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
              }
            }
          },
          where: {
            parentId: null // Only top-level messages
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
};

// Update project
const updateProject = async (req, res) => {
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
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    await prisma.project.delete({
      where: { id: projectId }
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

// Add member to project
const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: user.id
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        projectId: projectId,
        userId: user.id,
        role: 'member'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      member
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member'
    });
  }
};

// Remove member from project
const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    await prisma.projectMember.delete({
      where: { id: memberId }
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member'
    });
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
