const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const { protect } = require('../middleware/auth');

// @route   GET /api/memberships/my
// @desc    Get current user's memberships
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const memberships = await Membership.find({ user: req.user.id })
      .populate('community', 'name logo category status');

    res.json({ success: true, data: memberships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
