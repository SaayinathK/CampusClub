const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Community = require('../models/Community');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Helper: create / replace "registration closing" notifications when deadline is set
async function scheduleRegistrationClosingNotifs(event, community) {
  if (!event.registrationDeadline || !community || !community.members.length) return;

  const deadline = new Date(event.registrationDeadline);
  const notifTime = new Date(deadline.getTime() - 24 * 60 * 60 * 1000); // 24h before

  // Only create if the scheduled time is still in the future
  if (notifTime <= new Date()) return;

  const deadlineLabel = deadline.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  // Remove any existing registration_closing notifs for this event (re-sync on update)
  await Notification.deleteMany({ event: event._id, type: 'registration_closing' });

  const notifs = community.members
    .filter(m => m.status === 'approved')
    .map(m => ({
      recipient: m.user,
      type: 'registration_closing',
      event: event._id,
      title: `Registration Closing: ${event.title}`,
      message: `Registration for "${event.title}" closes on ${deadlineLabel}. Register now before spots run out!`,
      scheduledFor: notifTime,
    }));

  if (notifs.length) await Notification.insertMany(notifs);
}

// Helper: create event published + reminder notifications for all community members
async function notifyEventPublished(event, community) {
  if (!community || !community.members.length) return;

  const eventDateLabel = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const venueLabel = event.venue ? ` at ${event.venue}` : '';

  // Immediate: event is now published
  const publishedNotifs = community.members.map(m => ({
    recipient: m.user,
    type: 'event_published',
    event: event._id,
    title: `New Event: ${event.title}`,
    message: `${community.name} has published a new event "${event.title}" on ${eventDateLabel}${venueLabel}.`,
    scheduledFor: new Date(),
  }));

  // Reminder: visible on the day the event starts
  const reminderDate = new Date(event.startDate);
  reminderDate.setHours(0, 0, 0, 0);
  const reminderNotifs = community.members.map(m => ({
    recipient: m.user,
    type: 'event_reminder',
    event: event._id,
    title: `Today: ${event.title}`,
    message: `The event "${event.title}" by ${community.name} is happening today${venueLabel}!`,
    scheduledFor: reminderDate,
  }));

  // Notify the CA whose event was approved
  const caNotif = {
    recipient: event.createdBy,
    type: 'event_published',
    event: event._id,
    title: `Event Approved: ${event.title}`,
    message: `Your event "${event.title}" has been approved and is now live!`,
    scheduledFor: new Date(),
  };

  await Notification.insertMany([...publishedNotifs, ...reminderNotifs, caNotif]);
}

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

// @route   GET /api/events/my-registrations
// @desc    Get all events the current student is registered for
// @access  Private/Student
router.get('/my-registrations', protect, authorize('student'), async (req, res) => {
  try {
    const events = await Event.find({ 'participants.user': req.user.id })
      .populate('community', 'name logo category')
      .select('title startDate endDate venue status category coverImage isFree ticketPrice participants community')
      .sort({ startDate: -1 });

    const result = events.map((ev) => {
      const myParticipant = ev.participants.find((p) => p.user && p.user.toString() === req.user.id);
      return {
        _id: ev._id,
        title: ev.title,
        startDate: ev.startDate,
        endDate: ev.endDate,
        venue: ev.venue,
        status: ev.status,
        category: ev.category,
        coverImage: ev.coverImage,
        isFree: ev.isFree,
        ticketPrice: ev.ticketPrice,
        community: ev.community,
        participant: myParticipant,
      };
    });

    res.json({ success: true, count: result.length, data: result });
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

    const { registrationDeadline } = req.body;

    const event = await Event.create({
      title, description, category, startDate, endDate,
      venue, isVirtual, virtualLink, maxParticipants,
      allowExternal, tags, coverImage, registrationDeadline,
      community: community._id,
      createdBy: req.user.id,
      status: 'pending_approval',
    });

    // Schedule registration_closing notifications if deadline is set
    if (registrationDeadline) {
      await scheduleRegistrationClosingNotifs(event, community);
    }

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

    const updatable = [
      'title', 'description', 'category', 'startDate', 'endDate', 'venue',
      'isVirtual', 'virtualLink', 'maxParticipants', 'allowExternal', 'tags',
      'coverImage', 'isFree', 'ticketPrice', 'registrationDeadline',
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    // Editing a rejected event automatically re-submits it for approval
    if (req.user.role === 'community_admin' && event.status === 'rejected') {
      event.status = 'pending_approval';
      event.rejectionReason = '';
    }

    await event.save();

    // Re-schedule registration_closing notifications if deadline changed
    if (req.body.registrationDeadline !== undefined) {
      const community = await Community.findById(event.community).populate('members.user', '_id');
      await scheduleRegistrationClosingNotifs(event, community);
    }

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

    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found — it may have been deleted. Please refresh the page.' });

    if (req.user.role === 'community_admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Admin can force any valid status — skip transition rules
    if (req.user.role !== 'admin') {
      const allowed = caTransitions[event.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `This event is currently "${event.status}" and cannot be changed to "${status}". Please refresh the page.`,
        });
      }
    }

    event.status = status;
    await event.save();

    // If cancelled, notify all registered student participants
    if (status === 'cancelled' && event.participants.length > 0) {
      const studentParticipants = event.participants.filter(p => p.user);
      if (studentParticipants.length > 0) {
        const cancelNotifs = studentParticipants.map(p => ({
          recipient: p.user,
          type: 'event_cancelled',
          event: event._id,
          title: `Event Cancelled: ${event.title}`,
          message: `Unfortunately, the event "${event.title}" has been cancelled. We're sorry for the inconvenience.`,
          scheduledFor: new Date(),
        }));
        await Notification.insertMany(cancelNotifs);
      }
    }

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

    // Notify community members + CA
    const community = await Community.findById(event.community);
    await notifyEventPublished(event, community);

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

    // Notify the CA
    await Notification.create({
      recipient: event.createdBy,
      type: 'event_rejected',
      event: event._id,
      title: `Event Rejected: ${event.title}`,
      message: `Your event "${event.title}" was rejected.${reason ? ` Reason: ${reason}` : ''} You can edit and re-submit it.`,
      scheduledFor: new Date(),
    });

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

// @route   GET /api/events/my-registrations
// @desc    Get all events the current student is registered for
// @access  Private/Student
router.get('/my-registrations', protect, authorize('student'), async (req, res) => {
  try {
    const events = await Event.find({ 'participants.user': req.user.id })
      .populate('community', 'name logo category')
      .select('title startDate endDate venue status category coverImage isFree ticketPrice participants community')
      .sort({ startDate: -1 });

    const result = events.map((ev) => {
      const myParticipant = ev.participants.find((p) => p.user && p.user.toString() === req.user.id);
      return {
        _id: ev._id,
        title: ev.title,
        startDate: ev.startDate,
        endDate: ev.endDate,
        venue: ev.venue,
        status: ev.status,
        category: ev.category,
        coverImage: ev.coverImage,
        isFree: ev.isFree,
        ticketPrice: ev.ticketPrice,
        community: ev.community,
        participant: myParticipant,
      };
    });

    res.json({ success: true, count: result.length, data: result });
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

    const paymentStatus = event.isFree ? 'not_required' : 'pending';
    event.participants.push({ user: req.user.id, type: 'student', paymentStatus });
    await event.save();

    // Notify the student that their registration is confirmed
    const eventDateLabel = new Date(event.startDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    await Notification.create({
      recipient: req.user.id,
      type: 'registration_confirmed',
      event: event._id,
      title: `Registered: ${event.title}`,
      message: event.isFree
        ? `You're registered for "${event.title}" on ${eventDateLabel}. See you there!`
        : `You're registered for "${event.title}" on ${eventDateLabel}. Please upload your payment receipt to confirm your spot.`,
      scheduledFor: new Date(),
    });

    res.json({
      success: true,
      message: event.isFree
        ? 'Successfully registered for the event!'
        : 'Registered! Please upload your payment receipt to confirm your spot.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/events/:id/register
// @desc    Student unregisters from an event
// @access  Private/Student
router.delete('/:id/register', protect, authorize('student'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Cannot unregister from this event' });
    }

    const participantIndex = event.participants.findIndex(
      (p) => p.user && p.user.toString() === req.user.id
    );
    if (participantIndex === -1) {
      return res.status(400).json({ success: false, message: 'You are not registered for this event' });
    }

    event.participants.splice(participantIndex, 1);
    await event.save();

    res.json({ success: true, message: 'Successfully unregistered from the event.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/events/:id/export
// @desc    Export participant/registration data as CSV
// @access  Private/Community Admin or Admin
router.get('/:id/export', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('participants.user', 'name email itNumber');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const rows = [
      ['#', 'Name', 'Email', 'IT Number', 'Type', 'Registered At', 'Attended', 'Payment Status'],
    ];

    event.participants.forEach((p, i) => {
      rows.push([
        i + 1,
        p.user ? p.user.name : (p.externalName || 'External'),
        p.user ? p.user.email : (p.externalEmail || ''),
        p.user ? (p.user.itNumber || '') : '',
        p.type,
        new Date(p.registeredAt).toLocaleDateString('en-US'),
        p.attended ? 'Yes' : 'No',
        p.paymentStatus || 'not_required',
      ]);
    });

    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
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

// @route   PUT /api/events/:id/attendance
// @desc    Mark attendance for one or many participants (toggle attended flag)
// @access  Private/Community Admin or Admin
router.put('/:id/attendance', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const { participantId, attended } = req.body;
    // participantId = the _id of the participants subdocument
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (req.user.role === 'community_admin' && event.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const participant = event.participants.id(participantId);
    if (!participant) return res.status(404).json({ success: false, message: 'Participant not found' });

    participant.attended = attended;
    await event.save();

    res.json({ success: true, message: `Attendance ${attended ? 'marked' : 'unmarked'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/events/:id/attendance/bulk
// @desc    Bulk mark/unmark attendance for all participants
// @access  Private/Community Admin or Admin
router.put('/:id/attendance/bulk', protect, authorize('community_admin', 'admin'), async (req, res) => {
  try {
    const { attended } = req.body; // true = mark all present, false = mark all absent
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (req.user.role === 'community_admin' && event.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    event.participants.forEach(p => { p.attended = attended; });
    await event.save();

    res.json({ success: true, message: `All participants marked as ${attended ? 'present' : 'absent'}` });
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
