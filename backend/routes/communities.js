const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/communities
// @desc    Get all approved communities (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { status: 'approved', isActive: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const communities = await Community.find(query)
      .populate('admin', 'name avatar')
      .select('-members')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Community.countDocuments(query);

    res.json({ success: true, count: communities.length, total, data: communities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/communities/all (Admin - all including pending)
// @access  Private/Admin
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const communities = await Community.find(query)
      .populate('admin', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: communities.length, data: communities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/communities/my/profile
// @desc    Get community admin's own community
// @access  Private/Community Admin
// NOTE: Must be defined BEFORE /:id or Express would match /:id with id='my'
router.get('/my/profile', protect, authorize('community_admin'), async (req, res) => {
  try {
    const community = await Community.findOne({ admin: req.user.id })
      .populate('admin', 'name avatar email')
      .populate('members.user', 'name avatar itNumber email');

    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    res.json({ success: true, data: community });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/communities/:id
// @desc    Get single community
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('admin', 'name avatar email')
      .populate('members.user', 'name avatar itNumber');

    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    // Events are stored separately — query by community reference instead of a stored array
    const events = await Event.find({ community: community._id, status: 'published' })
      .select('title startDate venue category coverImage status')
      .sort({ startDate: 1 });

    res.json({ success: true, data: { ...community.toJSON(), events } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/communities/:id
// @desc    Update community profile
// @access  Private/Community Admin (own) or Admin
router.put('/:id', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    // Community admin can only update their own community
    if (req.user.role === 'community_admin' && community.admin.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this community' });
    }

    const { name, description, category, logo, coverImage, socialLinks, isActive, status } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (category) updateFields.category = category;
    if (logo !== undefined) updateFields.logo = logo;
    if (coverImage !== undefined) updateFields.coverImage = coverImage;
    if (socialLinks) updateFields.socialLinks = socialLinks;
    if (isActive !== undefined && req.user.role === 'admin') updateFields.isActive = isActive;
    if (status !== undefined && req.user.role === 'admin') updateFields.status = status;

    const updated = await Community.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('admin', 'name avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/communities/:id/approve
// @desc    Approve a community (Admin only)
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user.id, approvedAt: new Date() },
      { new: true }
    );
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    res.json({ success: true, message: 'Community approved', data: community });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/communities/:id/reject
// @desc    Reject a community (Admin only)
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', approvedBy: req.user.id, rejectionReason: reason || 'Not specified' },
      { new: true }
    );
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    res.json({ success: true, message: 'Community rejected', data: community });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/communities/:id/members
// @desc    Get community members
// @access  Private/Community Admin or Admin
router.get('/:id/members', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate('members.user', 'name email avatar itNumber createdAt');

    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    if (req.user.role === 'community_admin' && community.admin.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, count: community.members.length, data: community.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/communities/:id/join
// @desc    Student requests to join a community
// @access  Private/Student
router.post('/:id/join', protect, authorize('student'), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    if (community.status !== 'approved') return res.status(400).json({ success: false, message: 'Community is not active' });

    // Check if already a member
    const isMember = community.members.find((m) => m.user.toString() === req.user.id);
    if (isMember) return res.status(400).json({ success: false, message: 'Already a member' });

    // Check for existing pending request
    const existingRequest = await Membership.findOne({ user: req.user.id, community: req.params.id });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: `Request already ${existingRequest.status}` });
    }

    const { message } = req.body;
    await Membership.create({ user: req.user.id, community: req.params.id, message });

    res.status(201).json({ success: true, message: 'Join request submitted. Awaiting Community Admin approval.' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Request already submitted' });
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/communities/:id/join-requests
// @desc    Get pending join requests
// @access  Private/Community Admin
router.get('/:id/join-requests', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    if (req.user.role === 'community_admin' && community.admin.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const requests = await Membership.find({ community: req.params.id, status: 'pending' })
      .populate('user', 'name email itNumber avatar createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/communities/:id/join-requests/:requestId/approve
// @desc    Approve a join request
// @access  Private/Community Admin
router.put('/:id/join-requests/:requestId/approve', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    if (req.user.role === 'community_admin' && community.admin.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const membership = await Membership.findById(req.params.requestId);
    if (!membership) return res.status(404).json({ success: false, message: 'Request not found' });

    membership.status = 'approved';
    membership.reviewedBy = req.user.id;
    membership.reviewedAt = new Date();
    await membership.save();

    const joinedAt = new Date();

    // Add to Community.members (avoids duplicate via $addToSet on subdoc array using the user field)
    const alreadyMember = community.members.some((m) => m.user.toString() === membership.user.toString());
    if (!alreadyMember) {
      community.members.push({ user: membership.user, joinedAt });
      await community.save();
    }

    // Mirror in User.communities — only push if not already present
    const userDoc = await User.findById(membership.user).select('communities');
    const alreadyInUser = userDoc.communities.some(
      (c) => c.community.toString() === community._id.toString()
    );
    if (!alreadyInUser) {
      await User.findByIdAndUpdate(
        membership.user,
        { $push: { communities: { community: community._id, joinedAt } } },
        { runValidators: false }
      );
    }

    res.json({ success: true, message: 'Membership approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/communities/:id/join-requests/:requestId/reject
// @desc    Reject a join request
// @access  Private/Community Admin
router.put('/:id/join-requests/:requestId/reject', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const membership = await Membership.findById(req.params.requestId);
    if (!membership) return res.status(404).json({ success: false, message: 'Request not found' });

    membership.status = 'rejected';
    membership.reviewedBy = req.user.id;
    membership.reviewedAt = new Date();
    membership.rejectionReason = reason;
    await membership.save();

    res.json({ success: true, message: 'Membership rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/communities/:id/members/:userId
// @desc    Remove a member from community
// @access  Private/Community Admin
router.delete('/:id/members/:userId', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    community.members = community.members.filter((m) => m.user.toString() !== req.params.userId);
    await community.save();

    await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { communities: { community: community._id } } },
      { runValidators: false }
    );

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
