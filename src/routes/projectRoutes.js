const express = require('express');
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { createProjectValidator, updateProjectValidator } = require('../middleware/validators');
const router = express.Router();

router.use(protect);

router.route('/')
    .get(getProjects)
    .post(createProjectValidator, createProject);

router.route('/:id')
    .get(getProject)
    .put(updateProjectValidator, updateProject)
    .delete(deleteProject);
router.use('/:projectId/tasks', require('./taskRoutes'));  // ✅ Nested!

module.exports = router;
