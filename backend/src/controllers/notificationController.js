import { Community } from '../models/Community.js';
import { Event } from '../models/Event.js';
import { Notification } from '../models/Notification.js';
import { NotificationReceipt } from '../models/NotificationReceipt.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';
import { sendNotificationEmails } from '../services/mailjetService.js';
import {
  publishToRole,
  publishToUser,
  publishToUsers,
  subscribeToNotificationStream
} from '../services/realtimeNotificationService.js';
import {
  NOTIFICATION_TYPES,
  normalizeText,
  validateNotificationPayload,
  validateObjectId
} from '../utils/validation.js';

function mapReceipt(receipt) {
  return {
    _id: receipt._id,
    isRead: receipt.isRead,
    readAt: receipt.readAt,
    createdAt: receipt.createdAt,
    notification: receipt.notification
  };
}

async function getReceiptsForNotification(notificationId, userIds) {
  const filter = { notification: notificationId };

  if (userIds?.length) {
    filter.user = { $in: userIds };
  }

  return NotificationReceipt.find(filter)
    .sort({ createdAt: -1 })
    .populate({
      path: 'notification',
      populate: [
        {
          path: 'event',
          select: 'title'
        },
        {
          path: 'community',
          select: 'name'
        }
      ]
    });
}

async function resolveRecipients(audienceType, eventId, communityId) {
  if (audienceType === 'All Students') {
    return User.find({ role: 'student' }).select('name email');
  }

  if (audienceType === 'Event Registrants') {
    const registrations = await Registration.find({
      event: eventId,
      status: { $in: ['Registered', 'Attended'] }
    }).populate('student', 'name email');

    return registrations
      .map((registration) => registration.student)
      .filter(Boolean);
  }

  const communityEvents = await Event.find({ community: communityId }).select('_id');
  const eventIds = communityEvents.map((event) => event._id);

  if (eventIds.length === 0) {
    return [];
  }

  const registrations = await Registration.find({
    event: { $in: eventIds },
    status: { $in: ['Registered', 'Attended'] }
  }).populate('student', 'name email');

  const uniqueStudents = new Map();

  registrations.forEach((registration) => {
    if (registration.student) {
      uniqueStudents.set(String(registration.student._id), registration.student);
    }
  });

  return [...uniqueStudents.values()];
}

export async function createNotification(req, res) {
  try {
    const {
      title,
      message,
      type,
      audienceType,
      eventId,
      communityId
    } = req.body;
    const validationError = validateNotificationPayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    let audienceLabel = 'All Students';
    let relatedEvent = null;
    let relatedCommunity = null;

    if (audienceType === 'Event Registrants') {
      relatedEvent = await Event.findById(eventId).populate('community', 'name');

      if (!relatedEvent) {
        return res.status(404).json({ message: 'Selected event was not found.' });
      }

      audienceLabel = relatedEvent.title;
      relatedCommunity = relatedEvent.community?._id || null;
    }

    if (audienceType === 'Specific Community') {
      relatedCommunity = await Community.findById(communityId);

      if (!relatedCommunity) {
        return res.status(404).json({ message: 'Selected community was not found.' });
      }

      audienceLabel = relatedCommunity.name;
    }

    const recipients = await resolveRecipients(
      audienceType,
      relatedEvent?._id || eventId,
      relatedCommunity?._id || communityId
    );

    const notification = await Notification.create({
      title: normalizeText(title),
      message: normalizeText(message),
      type: NOTIFICATION_TYPES.includes(type) ? type : 'System',
      audienceType,
      audienceLabel,
      recipientsCount: recipients.length,
      event: relatedEvent?._id || null,
      community: relatedCommunity?._id || null,
      createdBy: req.user._id
    });

    if (recipients.length > 0) {
      await NotificationReceipt.insertMany(
        recipients.map((recipient) => ({
          notification: notification._id,
          user: recipient._id
        }))
      );
    }

    try {
      const emailResult = await sendNotificationEmails({
        recipients,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        audienceLabel
      });

      notification.emailStatus = emailResult.status;
      notification.status = 'Sent';
      await notification.save();
    } catch {
      notification.emailStatus = 'Failed';
      notification.status = 'Failed';
      await notification.save();
    }

    const populatedNotification = await Notification.findById(notification._id)
      .populate('event', 'title')
      .populate('community', 'name')
      .populate('createdBy', 'name email');

    const studentReceipts = await getReceiptsForNotification(
      notification._id,
      recipients.map((recipient) => recipient._id)
    );

    const receiptPayloadsByUserId = new Map(
      studentReceipts.map((receipt) => [String(receipt.user), mapReceipt(receipt)])
    );

    publishToUsers(
      recipients.map((recipient) => recipient._id),
      'notification',
      (userId) => ({
        type: 'created',
        notification: receiptPayloadsByUserId.get(String(userId)) || null
      })
    );
    publishToRole('admin', 'notification', {
      type: 'created',
      notification: populatedNotification
    });

    return res.status(201).json({
      message: 'Notification sent successfully.',
      notification: populatedNotification
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to send notification right now.',
      details: error.message
    });
  }
}

export async function getAdminNotifications(_req, res) {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('event', 'title')
      .populate('community', 'name')
      .populate('createdBy', 'name email');

    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load notifications right now.',
      details: error.message
    });
  }
}

export async function getMyNotifications(req, res) {
  try {
    const receipts = await NotificationReceipt.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'notification',
        populate: [
          {
            path: 'event',
            select: 'title'
          },
          {
            path: 'community',
            select: 'name'
          }
        ]
      });

    const notifications = receipts
      .filter((receipt) => receipt.notification)
      .map(mapReceipt);

    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load your notifications right now.',
      details: error.message
    });
  }
}

export async function markNotificationAsRead(req, res) {
  try {
    const idError = validateObjectId(req.params.id, 'Notification');

    if (idError) {
      return res.status(400).json({ message: idError });
    }

    const receipt = await NotificationReceipt.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate({
      path: 'notification',
      populate: [
        {
          path: 'event',
          select: 'title'
        },
        {
          path: 'community',
          select: 'name'
        }
      ]
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    receipt.isRead = true;
    receipt.readAt = new Date();
    await receipt.save();

    const payload = mapReceipt(receipt);

    publishToUser(req.user._id, 'notification', {
      type: 'updated',
      notification: payload
    });

    return res.json({
      message: 'Notification marked as read.',
      notification: payload
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to update notification right now.',
      details: error.message
    });
  }
}

export async function markAllNotificationsAsRead(req, res) {
  try {
    const now = new Date();
    const unreadReceipts = await NotificationReceipt.find({
      user: req.user._id,
      isRead: false
    }).select('_id');

    await NotificationReceipt.updateMany(
      {
        user: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: now
        }
      }
    );

    publishToUser(req.user._id, 'notification', {
      type: 'bulk_read',
      ids: unreadReceipts.map((receipt) => String(receipt._id)),
      readAt: now.toISOString()
    });

    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to update notifications right now.',
      details: error.message
    });
  }
}

export async function deleteNotificationForStudent(req, res) {
  try {
    const idError = validateObjectId(req.params.id, 'Notification');

    if (idError) {
      return res.status(400).json({ message: idError });
    }

    const receipt = await NotificationReceipt.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    publishToUser(req.user._id, 'notification', {
      type: 'deleted',
      id: String(receipt._id)
    });

    return res.json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to delete notification right now.',
      details: error.message
    });
  }
}

export async function streamNotifications(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const unsubscribe = subscribeToNotificationStream({
    userId: req.user._id,
    role: req.user.role,
    response: res
  });

  req.on('close', () => {
    unsubscribe();
    res.end();
  });
}
