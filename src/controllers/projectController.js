const Project = require('../models/Project');

// @desc    Get all projects for logged-in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    const projects = await Project.find({
        owner: req.user._id
    }).populate('owner', 'name email');

    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
    });
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
    const project = await Project.findOne({
        _id: req.params.id,
        owner: req.user._id
    }).populate('owner', 'name email')
        .populate('members', 'name email');

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    res.status(200).json({
        success: true,
        data: project
    });
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    const project = await Project.create({
        ...req.body,
        owner: req.user._id
    });

    res.status(201).json({
        success: true,
        data: project
    });
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
    // Allow updates to name, description, status, members
    const { name, description, status, members } = req.body;

    const project = await Project.findOneAndUpdate(
        {
            _id: req.params.id,
            owner: req.user._id
        },
        { name, description, status, members },
        {
            new: true,
            runValidators: true
        }
    );

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    res.status(200).json({
        success: true,
        data: project
    });
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    const project = await Project.findOneAndDelete({
        _id: req.params.id,
        owner: req.user._id
    });

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    res.status(200).json({
        success: true,
        data: {},
        message: 'Project deleted successfully'
    });
};

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
};