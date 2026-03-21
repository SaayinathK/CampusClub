const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Community = require('../models/Community');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all published events (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, communityId, status, search, page = 1, limit = 100 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (communityId) query.community = communityId;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const events = await Event.find(query)
      .populate('community', 'name logo category')
      .populate('createdBy', 'name avatar')
      .select('-participants')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({ success: true, count: events.length, total, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/events/pending
// @desc    Get all events awaiting admin approval
// @access  Private/Admin
router.get('/pending', protect, authorize('admin'), async (_req, res) => {
  try {
    const events = await Event.find({ status: 'pending_approval' })
      .populate('community', 'name logo category')
      .populate('createdBy', 'name email')
      .select('-participants')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/events/all
// @desc    Get all events across all statuses (Admin only)
// @access  Private/Admin
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, search, limit = 500 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const events = await Event.find(query)
      .populate('community', 'name logo category')
      .populate('createdBy', 'name email')
      .select('-participants')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/events/my-community
// @desc    Get events for community admin's community (all statuses)
// @access  Private/Community Admin
router.get('/my-community', protect, authorize('community_admin'), async (req, res) => {
  try {
    const community = await Community.findOne({ admin: req.user.id });
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    const events = await Event.find({ community: community._id })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public (published only for public, all for auth users)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('community', 'name logo category admin')
      .populate('createdBy', 'name avatar')
      .populate('participants.user', 'name avatar');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private/Community Admin
router.post('/', protect, authorize('community_admin'), async (req, res) => {
  try {
    const community = await Community.findOne({ admin: req.user.id, status: 'approved' });
    if (!community) return res.status(404).json({ success: false, message: 'Approved community not found' });

    const {
      title, description, category, startDate, endDate,
      venue, isVirtual, virtualLink, maxParticipants,
      allowExternal, tags, coverImage
    } = req.body;

    const event = await Event.create({
      title, description, category, startDate, endDate,
      venue, isVirtual, virtualLink, maxParticipants,
      allowExternal, tags, coverImage,
      community: community._id,
      createdBy: req.user.id,
      status: 'pending_approval', // always requires admin approval before going live
    });

    // Events are linked via Event.community — no need to push IDs onto the Community document.

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private/Community Admin (own) or Admin
router.put('/:id', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (req.user.role === 'community_admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatable = ['title', 'description', 'category', 'startDate', 'endDate', 'venue',
      'isVirtual', 'virtualLink', 'maxParticipants', 'allowExternal', 'tags', 'coverImage'];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    // Editing a rejected event automatically re-submits it for approval
    if (req.user.role === 'community_admin' && event.status === 'rejected') {
      event.status = 'pending_approval';
      event.rejectionReason = '';
    }

    await event.save();

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/events/:id/status
// @desc    Update event status (CA: limited transitions; Admin: full control)
// @access  Private/Community Admin or Admin
router.put('/:id/status', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    // CA can only cancel published events or mark them completed — cannot self-publish
    const caTransitions = {
      pending_approval: ['cancelled'],
      published: ['completed', 'cancelled'],
      rejected: ['pending_approval'], // re-submit after editing
      completed: [],
      cancelled: [],
      draft: ['pending_approval', 'cancelled'],
    };

    // Admin has full control
    const adminTransitions = {
      pending_approval: ['published', 'rejected'],
      published: ['completed', 'cancelled'],
      rejected: ['pending_approval'],
      completed: [],
      cancelled: ['pending_approval'],
      draft: ['pending_approval', 'published', 'cancelled'],
    };

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (req.user.role === 'community_admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Admin can force any valid status — skip transition rules
    if (req.user.role !== 'admin') {
      const allowed = caTransitions[event.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot transition from '${event.status}' to '${status}'`,
        });
      }
    }

    event.status = status;
    await event.save();

    res.json({ success: true, message: `Event status updated to '${status}'`, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/events/:id/approve
// @desc    Admin approves an event (pending_approval → published)
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Event is not pending approval' });
    }

    event.status = 'published';
    await event.save();

    res.json({ success: true, message: 'Event approved and published', data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/events/:id/reject
// @desc    Admin rejects an event (pending_approval → rejected)
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Event is not pending approval' });
    }

    event.status = 'rejected';
    if (reason) event.rejectionReason = reason;
    await event.save();

    res.json({ success: true, message: 'Event rejected', data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/events/join/:code
// @desc    External participant join event via code
// @access  Public
router.post('/join/:code', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const event = await Event.findOne({ eventCode: req.params.code.toUpperCase(), status: 'published' });
    if (!event) return res.status(404).json({ success: false, message: 'Invalid event code or event not active' });
    if (!event.allowExternal) return res.status(403).json({ success: false, message: 'This event does not allow external participants' });

    // Check if already registered
    const alreadyRegistered = event.participants.find((p) => p.externalEmail === email);
    if (alreadyRegistered) return res.status(400).json({ success: false, message: 'Already registered for this event' });

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    event.participants.push({ externalName: name, externalEmail: email, type: 'external' });
    await event.save();

    const populatedEvent = await Event.findById(event._id).populate('community', 'name logo');

    res.json({
      success: true,
      message: 'Successfully registered for the event!',
      data: {
        event: {
          title: populatedEvent.title,
          startDate: populatedEvent.startDate,
          venue: populatedEvent.venue,
          community: populatedEvent.community.name,
          isVirtual: populatedEvent.isVirtual,
          virtualLink: populatedEvent.isVirtual ? populatedEvent.virtualLink : undefined,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/events/:id/register
// @desc    Student registers for an event
// @access  Private/Student
router.post('/:id/register', protect, authorize('student'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'published') return res.status(400).json({ success: false, message: 'Event is not open for registration' });

    const alreadyRegistered = event.participants.find((p) => p.user && p.user.toString() === req.user.id);
    if (alreadyRegistered) return res.status(400).json({ success: false, message: 'Already registered' });

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    event.participants.push({ user: req.user.id, type: 'student' });
    await event.save();

    res.json({ success: true, message: 'Successfully registered for the event!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/events/:id/participants
// @desc    Get event participants
// @access  Private/Community Admin or Admin
router.get('/:id/participants', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('participants.user', 'name email itNumber');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.json({ success: true, count: event.participants.length, data: event.participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private/Community Admin or Admin
router.delete('/:id', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (req.user.role === 'community_admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
