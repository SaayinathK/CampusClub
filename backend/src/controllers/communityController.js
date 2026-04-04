import { Community } from '../models/Community.js';
import { Event } from '../models/Event.js';
import {
  normalizeText,
  validateCommunityPayload,
  validateObjectId
} from '../utils/validation.js';

function buildCommunityPayload(body, file, existingCommunity = null) {
  return {
    name: normalizeText(body.name),
    description: normalizeText(body.description),
    category: normalizeText(body.category),
    president: normalizeText(body.president),
    status: body.status === 'Pending' ? 'Pending' : 'Active',
    memberCount: Math.max(Number(body.memberCount) || 0, 0),
    eventCount: Math.max(Number(body.eventCount) || 0, 0),
    imageUrl: file ? `/uploads/${file.filename}` : existingCommunity?.imageUrl || ''
  };
}

export async function createCommunity(req, res) {
  try {
    const validationError = validateCommunityPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const community = await Community.create({
      ...buildCommunityPayload(req.body, req.file),
      createdBy: req.user._id
    });

    return res.status(201).json({
      message: 'Community created successfully.',
      community
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to create community right now.',
      details: error.message
    });
  }
}

export async function getCommunities(_req, res) {
  try {
    const communities = await Community.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role');

    return res.json({ communities });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load communities right now.',
      details: error.message
    });
  }
}

export async function updateCommunity(req, res) {
  try {
    const idError = validateObjectId(req.params.id, 'Community');

    if (idError) {
      return res.status(400).json({ message: idError });
    }

    const validationError = validateCommunityPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found.' });
    }

    Object.assign(community, buildCommunityPayload(req.body, req.file, community));
    await community.save();

    const populatedCommunity = await Community.findById(community._id).populate(
      'createdBy',
      'name email role'
    );

    return res.json({
      message: 'Community updated successfully.',
      community: populatedCommunity
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to update community right now.',
      details: error.message
    });
  }
}

export async function deleteCommunity(req, res) {
  try {
    const idError = validateObjectId(req.params.id, 'Community');

    if (idError) {
      return res.status(400).json({ message: idError });
    }

    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found.' });
    }

    const linkedEvents = await Event.countDocuments({ community: community._id });

    if (linkedEvents > 0) {
      return res.status(400).json({
        message: 'Delete the related events before deleting this community.'
      });
    }

    await community.deleteOne();

    return res.json({ message: 'Community deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to delete community right now.',
      details: error.message
    });
  }
}
