const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createPersonalTodo,
  getPersonalTodos,
  getPersonalTodo,
  updatePersonalTodo,
  deletePersonalTodo,
  togglePersonalTodo
} = require('../controllers/personalTodoController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const personalTodoValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value')
];

// Routes
router.post('/', personalTodoValidation, createPersonalTodo);
router.get('/', getPersonalTodos);
router.get('/:id', getPersonalTodo);
router.put('/:id', personalTodoValidation, updatePersonalTodo);
router.delete('/:id', deletePersonalTodo);
router.patch('/:id/toggle', togglePersonalTodo);

module.exports = router;
