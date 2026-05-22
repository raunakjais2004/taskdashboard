const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware');

// @route   GET /api/tasks/my-tasks
// @desc    Get all tasks assigned to the logged-in user
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching tasks' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task and assign it (Admin Only)
router.post('/', auth, async (req, res) => {
  try {
    // 1. Role Check: Only Admins can create and assign tasks
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Admins can assign tasks.' });
    }

    const { title, description, project, assignedTo, dueDate } = req.body;

    // 2. Create the task
    const newTask = new Task({
      title,
      description,
      project,       
      assignedTo,    
      dueDate
    });

    const savedTask = await newTask.save();

    // 3. REAL-TIME MAGIC: Broadcast the new task to all connected WebSocket clients
    req.app.get('io').emit('taskAssigned', savedTask);

    res.status(201).json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating task' });
  }
});

module.exports = router;