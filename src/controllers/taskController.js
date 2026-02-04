const taskService = require('../services/taskService');

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await taskService.getTasks(req.user.id, req.params.projectId, { page, limit });

    res.status(200).json({
        success: true,
        count: result.tasks.length,
        pagination: result.pagination,
        data: result.tasks
    });
};

// @desc    Get single task
// @route   GET /api/projects/:projectId/tasks/:id
// @access  Private
const getTask = async (req, res) => {
    const task = await taskService.getTask(req.user.id, req.params.projectId, req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    res.status(200).json({
        success: true,
        data: task
    });
};

// @desc    Get task statistics
// @route   GET /api/projects/:projectId/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
    const data = await taskService.getTaskStats(req.user.id, req.params.projectId);

    res.status(200).json({
        success: true,
        data
    });
};

// @desc    Create task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res) => {
    const task = await taskService.createTask(req.user.id, req.params.projectId, req.body);

    res.status(201).json({
        success: true,
        data: task
    });
};

// @desc    Update task
// @route   PUT /api/projects/:projectId/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    // Explicitly select allowed fields
    const { title, description, status, priority, deadline, assignedTo, tags } = req.body;
    const updateData = { title, description, status, priority, deadline, assignedTo, tags };

    const task = await taskService.updateTask(req.user.id, req.params.projectId, req.params.id, updateData);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    res.status(200).json({
        success: true,
        data: task
    });
};

// @desc    Delete task
// @route   DELETE /api/projects/:projectId/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    const task = await taskService.deleteTask(req.user.id, req.params.projectId, req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    res.status(200).json({
        success: true,
        data: {},
        message: 'Task deleted successfully'
    });
};

module.exports = {
    getTasks,
    getTask,
    getTaskStats,
    createTask,
    updateTask,
    deleteTask
};
