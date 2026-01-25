const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        // 1. Get page and limit from query strings, set defaults
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // 2. Run query with pagination
        const tasks = await Task.find({
            project: req.params.projectId,
            $or: [
                { assignedTo: req.user.id },
                { createdBy: req.user.id }
            ]
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Show newest tasks first

        // 3. Get total count for the frontend to calculate total pages
        const total = await Task.countDocuments({
            project: req.params.projectId,
            $or: [
                { assignedTo: req.user.id },
                { createdBy: req.user.id }
            ]
        });

        res.status(200).json({
            success: true,
            count: tasks.length,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            },
            data: tasks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single task
// @route   GET /api/projects/:projectId/tasks/:id
// @access  Private
const getTask = async (req, res) => {
    const task = await Task.findOne({
        _id: req.params.id,
        project: req.params.projectId,
        $or: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
        ]
    });

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
    // Optimized Pipeline with $facet
    const stats = await Task.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(req.params.projectId),
                $or: [
                    { assignedTo: new mongoose.Types.ObjectId(req.user.id) },
                    { createdBy: new mongoose.Types.ObjectId(req.user.id) }
                ]
            }
        },
        {
            $facet: {
                // Group by status
                byStatus: [
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ],
                // Total count
                totalCount: [
                    { $count: 'total' }
                ]
            }
        }
    ]);

    const result = stats[0];
    const totalTasks = result.totalCount[0] ? result.totalCount[0].total : 0;
    const formattedStats = result.byStatus.map(s => ({ status: s._id, count: s.count }));

    res.status(200).json({
        success: true,
        data: {
            stats: formattedStats,
            summary: {
                totalTasks,
                lastUpdated: new Date()
            }
        }
    });
};

// @desc    Create task
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res) => {
    const task = await Task.create({
        ...req.body,
        project: req.params.projectId,
        createdBy: req.user.id
    });

    res.status(201).json({
        success: true,
        data: task
    });
};

// @desc    Update task
// @route   PUT /api/projects/:projectId/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    // Explicitly select allowed fields to avoid unintended updates
    const { title, description, status, priority, deadline, assignedTo, tags } = req.body;
    const updateData = { title, description, status, priority, deadline, assignedTo, tags };

    const task = await Task.findOneAndUpdate(
        {
            _id: req.params.id,
            project: req.params.projectId,
            $or: [
                { assignedTo: req.user.id },
                { createdBy: req.user.id }
            ]
        },
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

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
    const task = await Task.findOneAndDelete({
        _id: req.params.id,
        project: req.params.projectId,
        createdBy: req.user.id // Only creator can delete? Or logic as before
    });

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
