const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');

// @route   GET /api/projects
// @desc    Get all projects for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ admin: req.user.userId }, { members: req.user.userId }]
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching projects' });
  }
});

// ---> ADD THIS NEW ROUTE <---
// @route   POST /api/projects
// @desc    Create a new project (Admin Only)
router.post('/', auth, async (req, res) => {
  try {
    // Backend Role Check: Block anyone who isn't an Admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Admins can create projects.' });
    }

    const { title, description } = req.body;

    // Create the project. The admin is the logged-in user.
    const newProject = new Project({
      title,
      description,
      admin: req.user.userId,
      members: [req.user.userId] // Add the admin as a member by default so it shows on their dashboard
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating project' });
  }
});

module.exports = router;