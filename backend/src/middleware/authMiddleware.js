const jwt = require('jsonwebtoken');
const { prisma } = require('../utils/db');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

const authorizeProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user is a member of the project
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Not a project member' 
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    console.error('Project authorization error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authorization error' 
    });
  }
};

const authorizeProjectAdmin = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user is admin or creator of the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdBy: userId },
          {
            members: {
              some: {
                userId: userId,
                role: 'admin'
              }
            }
          }
        ]
      }
    });

    if (!project) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Admin privileges required' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authorization error' 
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeProjectAccess,
  authorizeProjectAdmin
};
