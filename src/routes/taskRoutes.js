const express = require('express');
const { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { createTaskValidator, updateTaskValidator } = require('../middleware/validators');
const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
    .get(getTasks)
    .post(createTaskValidator, createTask);

router.route('/stats').get(getTaskStats);

router.route('/:id')
    .get(getTask)
    .put(updateTaskValidator, updateTask)
    .delete(deleteTask);

module.exports = router;