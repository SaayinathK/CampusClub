const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Community = require('../models/Community');
const Membership = require('../models/Membership');
const { createNotification } = require('../utils/notifications');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .populate('managedCommunity', 'name status')
      .populate('requestedCommunity', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Normalize legacy documents that stored display name as 'username' instead of 'name'
    const normalized = users.map(u => ({
      ...u,
      name: u.name || u.username || u.email,
    }));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: normalized.length,
      total,
      pages: Math.ceil(total / limit),
      data: normalized,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/pending-community-admins
// @desc    Get pending community admin registrations
// @access  Private/Admin
router.get('/pending-community-admins', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'community_admin', status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const normalized = users.map(u => ({ ...u, name: u.name || u.username || u.email }));

    res.json({ success: true, count: normalized.length, data: normalized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin)
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [total, admins, communityAdmins, students, pending, approved, rejected] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'community_admin' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ status: 'pending' }),
      User.countDocuments({ status: 'approved' }),
      User.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      success: true,
      data: { total, admins, communityAdmins, students, pending, approved, rejected },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/community/:communityId/pending-students
// @desc    Get pending student account registrations for a community (Community Admin)
// @access  Private/Community Admin
// NOTE: Must be defined BEFORE /:id or Express would match /:id with id='community'
router.get('/community/:communityId/pending-students', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const pendingStudents = await User.find({
      requestedCommunity: req.params.communityId,
      role: 'student',
      status: 'pending',
    }).select('-password').sort({ createdAt: -1 });

    res.json({ success: true, count: pendingStudents.length, data: pendingStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('managedCommunity', 'name status logo')
      .populate('communities.community', 'name logo');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:id/approve
// @desc    Approve a user (community_admin or student) - Admin approves community_admin
// @access  Private/Admin or Community Admin (for students)
router.put('/:id/approve', protect, authorize('admin', 'community_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.status === 'approved') {
      return res.status(400).json({ success: false, message: 'User is already approved' });
    }

    // Community Admin can only approve students (not other community admins)
    if (req.user.role === 'community_admin' && user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Community Admin can only approve students' });
    }

    // Use updateOne with runValidators: false so old documents with legacy
    // fields (username, old role enum values) don't fail schema validation
    await User.findByIdAndUpdate(
      user._id,
      { status: 'approved', approvedBy: req.user.id, approvedAt: new Date(), rejectionReason: null },
      { runValidators: false }
    );

    // If student is approved by community admin, enroll them in the requested community
    if (user.requestedCommunity) {
      const existingMembership = await Membership.findOne({ user: user._id, community: user.requestedCommunity });
      const joinedAt = new Date();
      if (!existingMembership) {
        await Membership.create({
          user: user._id,
          community: user.requestedCommunity,
          status: 'approved',
          reviewedBy: req.user.id,
          reviewedAt: joinedAt,
        });
      }
      // Add to Community.members if not already present
      await Community.findByIdAndUpdate(user.requestedCommunity, {
        $addToSet: { members: { user: user._id, joinedAt } },
      });
      // Mirror in User.communities using the new subdocument structure
      const studentDoc = await User.findById(user._id).select('communities');
      const alreadyEnrolled = studentDoc.communities.some(
        (c) => c.community.toString() === user.requestedCommunity.toString()
      );
      if (!alreadyEnrolled) {
        await User.findByIdAndUpdate(
          user._id,
          { $push: { communities: { community: user.requestedCommunity, joinedAt } } },
          { runValidators: false }
        );
      }
    }

    // If community_admin is approved, approve their community too
    if ((user.role === 'community_admin' || user.role === 'community') && user.communityName) {
      let community = await Community.findOne({ admin: user._id });
      if (!community) {
        // Fallback: create if somehow missing (e.g. legacy accounts)
        community = await Community.create({
          name: user.communityName,
          description: user.communityDescription || 'Community description',
          category: user.communityCategory || 'Other',
          admin: user._id,
        });
      }
      await Community.findByIdAndUpdate(community._id, {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      });
      await User.findByIdAndUpdate(user._id, { managedCommunity: community._id }, { runValidators: false });
    }

    const displayName = user.name || user.username;

    await createNotification({
      recipient: user._id,
      type: 'account_approved',
      title: 'Account Approved',
      message: `Your account for ${displayName} has been approved and is now active.`,
    });

    res.json({
      success: true,
      message: `User ${displayName} has been approved`,
      data: { id: user._id, name: displayName, status: 'approved' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:id/reject
// @desc    Reject a user
// @access  Private/Admin or Community Admin (for students)
router.put('/:id/reject', protect, authorize('admin', 'community_admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.user.role === 'community_admin' && user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Community Admin can only reject students' });
    }

    await User.findByIdAndUpdate(
      user._id,
      { status: 'rejected', approvedBy: req.user.id, rejectionReason: reason || 'Not specified' },
      { runValidators: false }
    );

    // If rejecting a community admin, reject their pending community too
    if (user.role === 'community_admin' || user.role === 'community') {
      await Community.findOneAndUpdate(
        { admin: user._id, status: 'pending' },
        { status: 'rejected', rejectionReason: reason || 'Not specified' }
      );
    }

    await createNotification({
      recipient: user._id,
      type: 'account_rejected',
      title: 'Account Rejected',
      message: `Your account was rejected.${reason ? ` Reason: ${reason}` : ''}`,
    });

    res.json({
      success: true,
      message: `User ${user.name || user.username} has been rejected`,
      data: { id: user._id, name: user.name || user.username, status: 'rejected' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Admin edit user (name, email, role, status)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: false,
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { ...user.toObject(), name: user.name || user.username || user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin account' });

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
