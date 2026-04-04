import { Community } from '../models/Community.js';
import { Event } from '../models/Event.js';
import { NotificationReceipt } from '../models/NotificationReceipt.js';
import { Registration } from '../models/Registration.js';

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

export async function getStudentFeed(req, res) {
  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const [liveNow, upcoming, recentlyCompleted, myRegistrations, unreadNotifications, activeCommunities] =
      await Promise.all([
        Event.find({
          status: 'Published',
          eventDate: {
            $gte: todayStart,
            $lte: todayEnd
          }
        })
          .sort({ eventDate: 1, createdAt: -1 })
          .populate('community', 'name imageUrl'),
        Event.find({
          status: 'Published',
          eventDate: {
            $gt: todayEnd
          }
        })
          .sort({ eventDate: 1, createdAt: -1 })
          .populate('community', 'name imageUrl')
          .limit(12),
        Event.find({
          $or: [
            { status: 'Completed' },
            {
              status: 'Published',
              eventDate: {
                $lt: todayStart
              }
            }
          ]
        })
          .sort({ eventDate: -1, createdAt: -1 })
          .populate('community', 'name imageUrl')
          .limit(9),
        Registration.countDocuments({
          student: req.user._id,
          status: {
            $in: ['Registered', 'Attended']
          }
        }),
        NotificationReceipt.countDocuments({
          user: req.user._id,
          isRead: false
        }),
        Community.countDocuments({
          status: 'Active'
        })
      ]);

    return res.json({
      sections: {
        liveNow,
        upcoming,
        recentlyCompleted
      },
      summary: {
        registeredEvents: myRegistrations,
        unreadNotifications,
        activeCommunities
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load the student feed right now.',
      details: error.message
    });
  }
}
