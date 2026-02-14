const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

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
    validateRequest
];

// Task Validators
const createTaskValidator = [
    body('title').trim().notEmpty().withMessage('Please add a task title'),
    body('description').notEmpty().withMessage('Please add a description'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
    body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Status must be todo, in-progress, or completed'),
    body('assignedTo').optional().custom((value) => {
        if (Array.isArray(value)) {
            const allValid = value.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!allValid) throw new Error('All IDs in assignedTo must be valid User IDs');
            return true;
        }
        if (typeof value === 'string') {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('assignedTo must be a valid User ID');
            }
            return true;
        }
        throw new Error('assignedTo must be a User ID or an array of User IDs');
    }),
    validateRequest
];

const updateTaskValidator = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['todo', 'in-progress', 'completed']),
    body('assignedTo').optional().custom((value) => {
        if (Array.isArray(value)) {
            const allValid = value.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!allValid) throw new Error('All IDs in assignedTo must be valid User IDs');
            return true;
        }
        if (typeof value === 'string') {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('assignedTo must be a valid User ID');
            }
            return true;
        }
        throw new Error('assignedTo must be a User ID or an array of User IDs');
    }),
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
