import { Community } from '../models/Community.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import {
  EVENT_STATUSES,
  normalizeText,
  validateEventPayload,
  validateObjectId
} from '../utils/validation.js';

function buildNormalizedEventDate(value) {
  return new Date(`${String(value).trim()}T12:00:00.000Z`);
}

function buildEventPayload(body, file, communityId, existingEvent = null) {
  return {
    title: normalizeText(body.title),
    description: normalizeText(body.description),
    eventDate: buildNormalizedEventDate(body.eventDate),
    time: normalizeText(body.time),
    venue: normalizeText(body.venue),
    category: normalizeText(body.category),
    capacity: Number(body.capacity),
    status: EVENT_STATUSES.includes(body.status)
      ? body.status
      : 'Draft',
    imageUrl: file ? `/uploads/${file.filename}` : existingEvent?.imageUrl || '',
    community: communityId
  };
}

async function populateEvent(eventId) {
  return Event.findById(eventId).populate('community', 'name imageUrl');
}

export async function createEvent(req, res) {
  try {
    const validationError = validateEventPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const parsedCapacity = Number(req.body.capacity);
    const normalizedEventDate = buildNormalizedEventDate(req.body.eventDate);

    if (!Number.isFinite(parsedCapacity) || parsedCapacity < 1) {
      return res.status(400).json({ message: 'Capacity must be at least 1.' });
    }

    if (Number.isNaN(normalizedEventDate.getTime())) {
      return res.status(400).json({ message: 'Event date is invalid.' });
    }

    const community = await Community.findById(req.body.communityId);

    if (!community) {
      return res.status(404).json({ message: 'Selected community was not found.' });
    }

    const event = await Event.create({
      ...buildEventPayload(req.body, req.file, community._id),
      createdBy: req.user._id
    });

    community.eventCount += 1;
    await community.save();

    const populatedEvent = await populateEvent(event._id);

    return res.status(201).json({
      message: 'Event created successfully.',
      event: populatedEvent
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to create event right now.',
      details: error.message
    });
  }
}

export async function getEvents(req, res) {
  try {
    const status = normalizeText(req.query.status);

    if (status && !EVENT_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Event status is invalid.' });
    }

    const filter = status ? { status } : {};
    const events = await Event.find(filter)
      .sort({ eventDate: 1, createdAt: -1 })
      .populate('community', 'name imageUrl');

    return res.json({ events });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load events right now.',
      details: error.message
    });
  }
}

export async function getEventById(req, res) {
  try {
    const idError = validateObjectId(req.params.id, 'Event');

    if (idError) {
      return res.status(400).json({ message: idError });
    }

    const event = await Event.findById(req.params.id).populate(
      'community',
      'name imageUrl description category president'
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    return res.json({ event });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load the event right now.',
      details: error.message
    });
  }
}

export async function updateEvent(req, res) {
  try {
    const idError = validateObjectId(req.params.id, 'Event');

    if (idError) {
      return res.status(400).json({ message: idError });
    }

    const validationError = validateEventPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const parsedCapacity = Number(req.body.capacity);
    const normalizedEventDate = buildNormalizedEventDate(req.body.eventDate);

    if (!Number.isFinite(parsedCapacity) || parsedCapacity < 1) {
      return res.status(400).json({ message: 'Capacity must be at least 1.' });
    }

    if (Number.isNaN(normalizedEventDate.getTime())) {
      return res.status(400).json({ message: 'Event date is invalid.' });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.registeredCount > parsedCapacity) {
      return res.status(400).json({
        message: 'Capacity cannot be lower than the current registered count.'
      });
    }

    const community = await Community.findById(req.body.communityId);

    if (!community) {
      return res.status(404).json({ message: 'Selected community was not found.' });
    }

    const previousCommunityId = String(event.community);

    Object.assign(
      event,
      buildEventPayload(req.body, req.file, community._id, event)
    );
    await event.save();

    if (previousCommunityId !== String(community._id)) {
      await Community.findByIdAndUpdate(previousCommunityId, { $inc: { eventCount: -1 } });
      await Community.findByIdAndUpdate(community._id, { $inc: { eventCount: 1 } });
    }

    const populatedEvent = await populateEvent(event._id);

    return res.json({
      message: 'Event updated successfully.',
      event: populatedEvent
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to update event right now.',
      details: error.message
    });
  }
}

export async function deleteEvent(req, res) {
  try {
    const idError = validateObjectId(req.params.id, 'Event');

    if (idError) {
      return res.status(400).json({ message: idError });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    await Registration.deleteMany({ event: event._id });
    await Community.findByIdAndUpdate(event.community, { $inc: { eventCount: -1 } });
    await event.deleteOne();

    return res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to delete event right now.',
      details: error.message
    });
  }
}
