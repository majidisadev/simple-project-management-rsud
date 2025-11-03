const express = require('express');
const KanbanTask = require('../models/KanbanTask');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks from all users
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await KanbanTask.find({})
      .populate('user', 'username')
      .sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task (from all users)
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await KanbanTask.findById(req.params.id).populate('user', 'username');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a title' });
    }

    // Get the highest order number for this status and user to add new task at the end
    const maxOrderTask = await KanbanTask.findOne(
      { user: req.user._id, status: status || 'backlog' }
    ).sort({ order: -1 });

    const task = new KanbanTask({
      user: req.user._id,
      title,
      description: description || '',
      status: status || 'backlog',
      priority: priority || 'medium',
      order: maxOrderTask ? maxOrderTask.order + 1 : 0
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task (only own tasks)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, order } = req.body;

    const task = await KanbanTask.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (order !== undefined) task.order = order;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task (only own tasks)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await KanbanTask.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

