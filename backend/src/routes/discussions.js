const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeProjectAccess } = require('../middleware/authMiddleware');
const {
  createMessage,
  getProjectMessages,
  getMessage,
  updateMessage,
  deleteMessage
} = require('../controllers/discussionController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const messageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  body('parentId')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      return typeof value === 'string' && value.length > 0;
    })
    .withMessage('Parent ID must be a valid string or empty')
];

// Routes
router.post('/projects/:projectId', authorizeProjectAccess, messageValidation, createMessage);
router.get('/projects/:projectId', authorizeProjectAccess, getProjectMessages);
router.get('/:messageId', getMessage);
router.put('/:messageId', messageValidation, updateMessage);
router.delete('/:messageId', deleteMessage);

module.exports = router;
