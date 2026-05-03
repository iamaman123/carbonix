const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard
// @desc    Get dashboard stats
router.get('/', protect, async (req, res) => {
  try {
    // Get all projects the user is involved in
    const projects = await Project.find({
      $or: [{ admin: req.user.id }, { members: req.user.id }]
    });

    const projectIds = projects.map(p => p._id);

    // Get all tasks for these projects
    const allTasks = await Task.find({ project: { $in: projectIds } });
    const userTasks = await Task.find({ assignedTo: req.user.id });

    // Stats
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress').length;
    const todoTasks = allTasks.filter(t => t.status === 'To Do').length;

    // Overdue Tasks (Not done and past due date)
    const overdueTasks = allTasks.filter(t => {
      if (!t.dueDate || t.status === 'Done') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    res.status(200).json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      myTasksCount: userTasks.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
