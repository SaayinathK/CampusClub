const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get current user's visible notifications (scheduledFor <= now)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    const notifications = await Notification.find({
      recipient: req.user.id,
      scheduledFor: { $lte: now },
    })
      .populate('event', 'title startDate venue status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
      scheduledFor: { $lte: now },
    });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
// NOTE: Must be defined before /:id/read to avoid Express matching 'read-all' as :id
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/notifications/read-all
// @desc    Delete all read notifications
// @access  Private
router.delete('/read-all', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id, read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a single notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, recipient: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
