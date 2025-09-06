const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeProjectAccess, authorizeProjectAdmin } = require('../middleware/authMiddleware');
const {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const projectValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const addMemberValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// Routes
router.post('/', projectValidation, createProject);
router.get('/', getUserProjects);
router.get('/:projectId', authorizeProjectAccess, getProject);
router.put('/:projectId', authorizeProjectAdmin, projectValidation, updateProject);
router.delete('/:projectId', authorizeProjectAdmin, deleteProject);
router.post('/:projectId/members', authorizeProjectAdmin, addMemberValidation, addMember);
router.delete('/:projectId/members/:memberId', authorizeProjectAdmin, removeMember);

module.exports = router;
