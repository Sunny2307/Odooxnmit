const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeProjectAccess } = require('../middleware/authMiddleware');
const {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  getUserTasks
} = require('../controllers/taskController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('assigneeId')
    .optional()
    .isString()
    .withMessage('Assignee ID must be a valid string'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('status')
    .optional()
    .isIn(['To-Do', 'In Progress', 'Done'])
    .withMessage('Status must be one of: To-Do, In Progress, Done')
];

// Validation rule for status-only updates
const statusUpdateValidation = [
  body('status')
    .isIn(['To-Do', 'In Progress', 'Done'])
    .withMessage('Status must be one of: To-Do, In Progress, Done')
];

// Routes
router.get('/my-tasks', getUserTasks);
router.post('/projects/:projectId', authorizeProjectAccess, taskValidation, createTask);
router.get('/projects/:projectId', authorizeProjectAccess, getProjectTasks);
router.get('/:taskId', getTask);
router.put('/:taskId', taskValidation, updateTask);
router.patch('/:taskId/status', statusUpdateValidation, updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
