const express = require('express');
const Report = require('../models/Report');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all reports for a user
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reports by date range (for calendar) - all users can view all reports
router.get('/calendar', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const reports = await Report.find(query).populate('user', 'username');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search reports by keyword - all users can search all reports
router.get('/search', auth, async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword || keyword.trim() === '') {
      return res.json([]);
    }
    
    const searchRegex = new RegExp(keyword, 'i');
    const reports = await Report.find({
      $or: [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } }
      ]
    })
    .populate('user', 'username')
    .sort({ date: -1 })
    .limit(50); // Limit results to 50
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single report - all users can view all reports
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('user', 'username');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create report
router.post('/', auth, async (req, res) => {
  try {
    const { date, content, title } = req.body;

    if (!date || !content) {
      return res.status(400).json({ message: 'Please provide date and content' });
    }

    const report = new Report({
      user: req.user._id,
      date: new Date(date),
      content,
      title: title || ''
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update report (only own reports)
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, content, title } = req.body;

    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found or you do not have permission' });
    }

    if (date) report.date = new Date(date);
    if (content !== undefined) report.content = content;
    if (title !== undefined) report.title = title;

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete report (only own reports)
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found or you do not have permission' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

