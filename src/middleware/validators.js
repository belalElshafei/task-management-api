const { body, validationResult } = require('express-validator');

// Middleware to check for validation errors
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Project Validators
const createProjectValidator = [
    body('name').trim().notEmpty().withMessage('Please add a project name'),
    body('description').trim().notEmpty().withMessage('Please add a description'),
    validateRequest
];

const updateProjectValidator = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    // Prevent strictly sensitive fields from being updated via validators is tricky without extra logic,
    // but we can sanitize the body or just ignore them in the controller.
    // However, the best practice is to validate what IS allowed.
    validateRequest
];

// Task Validators
const createTaskValidator = [
    body('title').trim().notEmpty().withMessage('Please add a task title'),
    body('description').notEmpty().withMessage('Please add a description'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
    body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Status must be todo, in-progress, or completed'),
    validateRequest
];

const updateTaskValidator = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['todo', 'in-progress', 'completed']),
    validateRequest
];

// Auth Validators
const registerValidator = [
    body('name').trim().notEmpty().withMessage('Please add a name'),
    body('email').isEmail().withMessage('Please add a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest
];

const loginValidator = [
    body('email').isEmail().withMessage('Please add a valid email'),
    body('password').exists().withMessage('Password is required'),
    validateRequest
];

module.exports = {
    createProjectValidator,
    updateProjectValidator,
    createTaskValidator,
    updateTaskValidator,
    registerValidator,
    loginValidator
};
