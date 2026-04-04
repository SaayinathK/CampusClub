import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import {
  validateObjectId,
  validateRegistrationPayload,
  validateRegistrationStatus
} from '../utils/validation.js';

function usesSeat(status) {
  return status === 'Registered' || status === 'Attended';
}

async function populateRegistration(registrationId) {
  return Registration.findById(registrationId)
    .populate('student', 'name email role')
    .populate({
      path: 'event',
      populate: {
        path: 'community',
        select: 'name imageUrl'
      }
    });
}

export async function createRegistration(req, res) {
  try {
    const validationError = validateRegistrationPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { eventId } = req.body;

    const event = await Event.findById(eventId).populate('community', 'name imageUrl');

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.status !== 'Published') {
      return res
        .status(400)
        .json({ message: 'Only published events can be registered.' });
    }

    const existingRegistration = await Registration.findOne({
      student: req.user._id,
      event: event._id
    });

    if (existingRegistration && existingRegistration.status !== 'Cancelled') {
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ message: 'This event is already full.' });
    }

    let registration;

    if (existingRegistration) {
      existingRegistration.status = 'Registered';
      registration = await existingRegistration.save();
    } else {
      registration = await Registration.create({
        student: req.user._id,
        event: event._id,
        status: 'Registered',
        paymentStatus: 'Free'
      });
    }

    event.registeredCount += 1;
    await event.save();

    const populatedRegistration = await populateRegistration(registration._id);

    return res.status(201).json({
      message: 'Registration completed successfully.',
      registration: populatedRegistration
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    return res.status(500).json({
      message: 'Unable to complete registration right now.',
      details: error.message
    });
  }
}

export async function getMyRegistrations(req, res) {
  try {
    const filter = { student: req.user._id };

    if (String(req.query.eventId || '').trim()) {
      if (!mongoose.Types.ObjectId.isValid(req.query.eventId)) {
        return res.status(400).json({ message: 'Event id is invalid.' });
      }

      filter.event = req.query.eventId;
    }

    const registrations = await Registration.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'event',
        populate: {
          path: 'community',
          select: 'name imageUrl'
        }
      })
      .populate('student', 'name email role');

    return res.json({ registrations });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load your registrations right now.',
      details: error.message
    });
  }
}

export async function cancelMyRegistration(req, res) {
  try {
    const idError = validateObjectId(req.params.id, 'Registration');

    if (idError) {
      return res.status(400).json({ message: idError });
    }

    const registration = await Registration.findOne({
      _id: req.params.id,
      student: req.user._id
    }).populate('event');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    if (registration.status === 'Cancelled') {
      return res.status(400).json({ message: 'Registration is already cancelled.' });
    }

    const consumedSeat = usesSeat(registration.status);
    registration.status = 'Cancelled';
    await registration.save();

    if (consumedSeat && registration.event.registeredCount > 0) {
      registration.event.registeredCount -= 1;
      await registration.event.save();
    }

    const populatedRegistration = await populateRegistration(registration._id);

    return res.json({
      message: 'Registration cancelled successfully.',
      registration: populatedRegistration
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to cancel registration right now.',
      details: error.message
    });
  }
}

export async function getAllRegistrations(_req, res) {
  try {
    const registrations = await Registration.find()
      .sort({ createdAt: -1 })
      .populate('student', 'name email role')
      .populate({
        path: 'event',
        populate: {
          path: 'community',
          select: 'name imageUrl'
        }
      });

    return res.json({ registrations });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load registrations right now.',
      details: error.message
    });
  }
}

export async function updateRegistrationStatus(req, res) {
  try {
    const { status } = req.body;
    const idError = validateObjectId(req.params.id, 'Registration');

    if (idError) {
      return res.status(400).json({ message: idError });
    }

    const validationError = validateRegistrationStatus(status);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const registration = await Registration.findById(req.params.id).populate('event');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    const oldUsesSeat = usesSeat(registration.status);
    const newUsesSeat = usesSeat(status);

    if (!oldUsesSeat && newUsesSeat) {
      if (registration.event.registeredCount >= registration.event.capacity) {
        return res.status(400).json({ message: 'The event is already full.' });
      }

      registration.event.registeredCount += 1;
    }

    if (oldUsesSeat && !newUsesSeat && registration.event.registeredCount > 0) {
      registration.event.registeredCount -= 1;
    }

    registration.status = status;
    await registration.save();
    await registration.event.save();

    const populatedRegistration = await populateRegistration(registration._id);

    return res.json({
      message: 'Registration status updated successfully.',
      registration: populatedRegistration
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to update registration right now.',
      details: error.message
    });
  }
}
