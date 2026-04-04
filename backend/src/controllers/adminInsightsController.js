import { Community } from '../models/Community.js';
import { Event } from '../models/Event.js';
import { Notification } from '../models/Notification.js';
import { Registration } from '../models/Registration.js';
import { User } from '../models/User.js';
import {
  normalizeText,
  validateReportFilters,
  validateReportType
} from '../utils/validation.js';

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function parseDateRange(query) {
  const range = {};

  if (String(query.fromDate || '').trim()) {
    const fromDate = startOfDay(query.fromDate);

    if (Number.isNaN(fromDate.getTime())) {
      throw new Error('From date is invalid.');
    }

    range.$gte = fromDate;
  }

  if (String(query.toDate || '').trim()) {
    const toDate = endOfDay(query.toDate);

    if (Number.isNaN(toDate.getTime())) {
      throw new Error('To date is invalid.');
    }

    range.$lte = toDate;
  }

  return Object.keys(range).length > 0 ? range : null;
}

function percentageChange(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function formatTrend(change) {
  const prefix = change > 0 ? '+' : '';
  return `${prefix}${change}%`;
}

function buildMonthBuckets(length = 6) {
  const now = new Date();
  const buckets = [];

  for (let index = length - 1; index >= 0; index -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - index + 1, 0, 23, 59, 59, 999);

    buckets.push({
      key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      monthStart,
      monthEnd,
      registrations: 0,
      attendance: 0
    });
  }

  return buckets;
}

function escapeCsv(value) {
  const normalized = String(value ?? '');

  if (normalized.includes('"') || normalized.includes(',') || normalized.includes('\n')) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }

  return normalized;
}

function createCsv(headers, rows) {
  const headerLine = headers.map((header) => escapeCsv(header)).join(',');
  const bodyLines = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(','));

  return [headerLine, ...bodyLines].join('\n');
}

function withCreatedAtFilter(filter, range) {
  if (!range) {
    return filter;
  }

  return {
    ...filter,
    createdAt: range
  };
}

export async function getDashboardOverview(_req, res) {
  try {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

    const [
      totalEvents,
      totalRegistrations,
      activeCommunities,
      totalStudents,
      recentEventCount,
      previousEventCount,
      recentRegistrationCount,
      previousRegistrationCount,
      recentCommunityCount,
      previousCommunityCount,
      recentStudentCount,
      previousStudentCount,
      notifications,
      recentEvents,
      recentCommunities,
      recentNotifications,
      recentRegistrations
    ] = await Promise.all([
      Event.countDocuments(),
      Registration.countDocuments(),
      Community.countDocuments({ status: 'Active' }),
      User.countDocuments({ role: 'student' }),
      Event.countDocuments({ createdAt: { $gte: currentPeriodStart, $lte: now } }),
      Event.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } }),
      Registration.countDocuments({ createdAt: { $gte: currentPeriodStart, $lte: now } }),
      Registration.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } }),
      Community.countDocuments({
        status: 'Active',
        createdAt: { $gte: currentPeriodStart, $lte: now }
      }),
      Community.countDocuments({
        status: 'Active',
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart }
      }),
      User.countDocuments({
        role: 'student',
        createdAt: { $gte: currentPeriodStart, $lte: now }
      }),
      User.countDocuments({
        role: 'student',
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart }
      }),
      Notification.find().lean(),
      Event.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('community', 'name')
        .populate('createdBy', 'name')
        .lean(),
      Community.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .populate('createdBy', 'name')
        .lean(),
      Notification.find()
        .sort({ createdAt: -1 })
        .limit(2)
        .populate('createdBy', 'name')
        .lean(),
      Registration.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('student', 'name')
        .populate('event', 'title')
        .lean()
    ]);

    const monthlyBuckets = buildMonthBuckets();

    const registrations = await Registration.find().select('createdAt status updatedAt').lean();

    registrations.forEach((registration) => {
      const createdAt = new Date(registration.createdAt);
      const registrationKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const registrationBucket = monthlyBuckets.find((item) => item.key === registrationKey);

      if (registrationBucket) {
        registrationBucket.registrations += 1;
      }

      if (registration.status === 'Attended') {
        const attendedAt = new Date(registration.updatedAt || registration.createdAt);
        const attendanceKey = `${attendedAt.getFullYear()}-${attendedAt.getMonth()}`;
        const attendanceBucket = monthlyBuckets.find((item) => item.key === attendanceKey);

        if (attendanceBucket) {
          attendanceBucket.attendance += 1;
        }
      }
    });

    const recentActivity = [
      ...recentEvents.map((event) => ({
        id: `event-${event._id}`,
        actor: event.createdBy?.name || 'Admin',
        action: 'created event',
        target: event.title,
        createdAt: event.createdAt
      })),
      ...recentCommunities.map((community) => ({
        id: `community-${community._id}`,
        actor: community.createdBy?.name || 'Admin',
        action: 'added community',
        target: community.name,
        createdAt: community.createdAt
      })),
      ...recentNotifications.map((notification) => ({
        id: `notification-${notification._id}`,
        actor: notification.createdBy?.name || 'Admin',
        action: 'sent notification',
        target: notification.title,
        createdAt: notification.createdAt
      })),
      ...recentRegistrations.map((registration) => ({
        id: `registration-${registration._id}`,
        actor: registration.student?.name || 'Student',
        action: 'registered for',
        target: registration.event?.title || 'Event',
        createdAt: registration.createdAt
      }))
    ]
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 6);

    const upcomingEvents = await Event.find({
      eventDate: { $gte: startOfDay(now) }
    })
      .sort({ eventDate: 1, createdAt: -1 })
      .limit(6)
      .select('title eventDate registeredCount capacity status')
      .lean();

    return res.json({
      kpis: [
        {
          title: 'Total Events',
          value: totalEvents,
          change: formatTrend(percentageChange(recentEventCount, previousEventCount)),
          trend: recentEventCount >= previousEventCount ? 'up' : 'down'
        },
        {
          title: 'Total Registrations',
          value: totalRegistrations,
          change: formatTrend(
            percentageChange(recentRegistrationCount, previousRegistrationCount)
          ),
          trend: recentRegistrationCount >= previousRegistrationCount ? 'up' : 'down'
        },
        {
          title: 'Active Communities',
          value: activeCommunities,
          change: formatTrend(
            percentageChange(recentCommunityCount, previousCommunityCount)
          ),
          trend: recentCommunityCount >= previousCommunityCount ? 'up' : 'down'
        },
        {
          title: 'Student Accounts',
          value: totalStudents,
          change: formatTrend(percentageChange(recentStudentCount, previousStudentCount)),
          trend: recentStudentCount >= previousStudentCount ? 'up' : 'down'
        }
      ],
      chartData: monthlyBuckets.map(({ month, registrations: count, attendance }) => ({
        month,
        registrations: count,
        attendance
      })),
      recentActivity,
      upcomingEvents,
      totals: {
        totalEvents,
        totalRegistrations,
        activeCommunities,
        totalStudents,
        totalNotifications: notifications.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load dashboard overview right now.',
      details: error.message
    });
  }
}

export async function getAnalyticsSummary(_req, res) {
  try {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

    const [
      registrations,
      events,
      communities,
      notifications,
      currentStudentGrowth,
      previousStudentGrowth
    ] = await Promise.all([
      Registration.find()
        .populate({
          path: 'event',
          select: 'title category community status'
        })
        .lean(),
      Event.find().populate('community', 'name').lean(),
      Community.find().lean(),
      Notification.find().lean(),
      User.countDocuments({
        role: 'student',
        createdAt: { $gte: currentPeriodStart, $lte: now }
      }),
      User.countDocuments({
        role: 'student',
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart }
      })
    ]);

    const participationBuckets = buildMonthBuckets();

    registrations.forEach((registration) => {
      const createdAt = new Date(registration.createdAt);
      const registrationKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const registrationBucket = participationBuckets.find((item) => item.key === registrationKey);

      if (registrationBucket) {
        registrationBucket.registrations += 1;
      }

      if (registration.status === 'Attended') {
        const attendedAt = new Date(registration.updatedAt || registration.createdAt);
        const attendanceKey = `${attendedAt.getFullYear()}-${attendedAt.getMonth()}`;
        const attendanceBucket = participationBuckets.find((item) => item.key === attendanceKey);

        if (attendanceBucket) {
          attendanceBucket.attendance += 1;
        }
      }
    });

    const topCommunities = communities
      .map((community) => ({
        name: community.name,
        events: events.filter(
          (event) => String(event.community?._id || event.community) === String(community._id)
        ).length
      }))
      .sort((left, right) => right.events - left.events)
      .slice(0, 5);

    const registrationStatusSummary = ['Registered', 'Attended', 'Cancelled'].map((status) => ({
      status,
      count: registrations.filter((registration) => registration.status === status).length
    }));

    const categoryMap = new Map();

    events.forEach((event) => {
      const key = event.category || 'Other';
      categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
    });

    const categoryDistribution = [...categoryMap.entries()].map(([name, value]) => ({
      name,
      value
    }));

    const attendedCount = registrations.filter(
      (registration) => registration.status === 'Attended'
    ).length;
    const activeRegistrationCount = registrations.filter(
      (registration) => registration.status === 'Registered' || registration.status === 'Attended'
    ).length;
    const publishedEvents = events.filter((event) => event.status === 'Published').length;
    const publishedEventRate =
      events.length > 0 ? Math.round((publishedEvents / events.length) * 100) : 0;
    const averageAttendanceRate =
      activeRegistrationCount > 0
        ? Math.round((attendedCount / activeRegistrationCount) * 100)
        : 0;

    return res.json({
      summaryCards: [
        {
          title: 'Avg. Attendance Rate',
          value: `${averageAttendanceRate}%`
        },
        {
          title: 'Student Growth',
          value: formatTrend(percentageChange(currentStudentGrowth, previousStudentGrowth))
        },
        {
          title: 'Published Events',
          value: `${publishedEventRate}%`
        },
        {
          title: 'Notifications Sent',
          value: notifications.length.toLocaleString()
        }
      ],
      participationData: participationBuckets.map(({ month, registrations: count, attendance }) => ({
        month,
        registrations: count,
        attendance
      })),
      topCommunities,
      registrationStatusSummary,
      categoryDistribution
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load analytics right now.',
      details: error.message
    });
  }
}

export async function getReportsSummary(req, res) {
  try {
    const validationError = validateReportFilters(req.query);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const range = parseDateRange(req.query);

    const [
      registrationsCount,
      eventsCount,
      communitiesCount,
      attendanceCount,
      notificationsCount
    ] = await Promise.all([
      Registration.countDocuments(withCreatedAtFilter({}, range)),
      Event.countDocuments(withCreatedAtFilter({}, range)),
      Community.countDocuments(withCreatedAtFilter({}, range)),
      Registration.countDocuments(withCreatedAtFilter({ status: 'Attended' }, range)),
      Notification.countDocuments(withCreatedAtFilter({}, range))
    ]);

    return res.json({
      reports: {
        registrations: registrationsCount,
        events: eventsCount,
        communities: communitiesCount,
        attendance: attendanceCount,
        notifications: notificationsCount
      }
    });
  } catch (error) {
    const status = error.message.includes('invalid') ? 400 : 500;

    return res.status(status).json({
      message: 'Unable to load report totals right now.',
      details: error.message
    });
  }
}

export async function exportReport(req, res) {
  try {
    const filtersError = validateReportFilters(req.query);

    if (filtersError) {
      return res.status(400).json({ message: filtersError });
    }

    const reportType = normalizeText(req.query.type);
    const reportTypeError = validateReportType(reportType);

    if (reportTypeError) {
      return res.status(400).json({ message: reportTypeError });
    }

    const range = parseDateRange(req.query);
    const createdAtFilter = range ? { createdAt: range } : {};
    let csv = '';
    let filename = '';

    if (reportType === 'registrations') {
      const registrations = await Registration.find(createdAtFilter)
        .sort({ createdAt: -1 })
        .populate('student', 'name email')
        .populate({
          path: 'event',
          select: 'title eventDate venue',
          populate: {
            path: 'community',
            select: 'name'
          }
        })
        .lean();

      csv = createCsv(
        [
          'Registration ID',
          'Student Name',
          'Student Email',
          'Event',
          'Community',
          'Event Date',
          'Venue',
          'Status',
          'Payment Status',
          'Registered At'
        ],
        registrations.map((registration) => [
          registration._id,
          registration.student?.name || '',
          registration.student?.email || '',
          registration.event?.title || '',
          registration.event?.community?.name || '',
          registration.event?.eventDate
            ? new Date(registration.event.eventDate).toISOString()
            : '',
          registration.event?.venue || '',
          registration.status,
          registration.paymentStatus,
          new Date(registration.createdAt).toISOString()
        ])
      );
      filename = 'registrations-report.csv';
    } else if (reportType === 'events') {
      const events = await Event.find(createdAtFilter)
        .sort({ createdAt: -1 })
        .populate('community', 'name')
        .populate('createdBy', 'name email')
        .lean();

      csv = createCsv(
        [
          'Event ID',
          'Title',
          'Community',
          'Category',
          'Event Date',
          'Time',
          'Venue',
          'Capacity',
          'Registered Count',
          'Status',
          'Created By',
          'Created At'
        ],
        events.map((event) => [
          event._id,
          event.title,
          event.community?.name || '',
          event.category,
          new Date(event.eventDate).toISOString(),
          event.time,
          event.venue,
          event.capacity,
          event.registeredCount,
          event.status,
          event.createdBy?.email || event.createdBy?.name || '',
          new Date(event.createdAt).toISOString()
        ])
      );
      filename = 'events-report.csv';
    } else if (reportType === 'communities') {
      const communities = await Community.find(createdAtFilter)
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email')
        .lean();

      csv = createCsv(
        [
          'Community ID',
          'Name',
          'Category',
          'President',
          'Status',
          'Members',
          'Events',
          'Created By',
          'Created At'
        ],
        communities.map((community) => [
          community._id,
          community.name,
          community.category,
          community.president,
          community.status,
          community.memberCount,
          community.eventCount,
          community.createdBy?.email || community.createdBy?.name || '',
          new Date(community.createdAt).toISOString()
        ])
      );
      filename = 'communities-report.csv';
    } else if (reportType === 'attendance') {
      const attendanceRows = await Registration.find({
        ...createdAtFilter,
        status: 'Attended'
      })
        .sort({ updatedAt: -1 })
        .populate('student', 'name email')
        .populate({
          path: 'event',
          select: 'title eventDate venue',
          populate: {
            path: 'community',
            select: 'name'
          }
        })
        .lean();

      csv = createCsv(
        [
          'Attendance ID',
          'Student Name',
          'Student Email',
          'Event',
          'Community',
          'Event Date',
          'Venue',
          'Attendance Marked At'
        ],
        attendanceRows.map((registration) => [
          registration._id,
          registration.student?.name || '',
          registration.student?.email || '',
          registration.event?.title || '',
          registration.event?.community?.name || '',
          registration.event?.eventDate
            ? new Date(registration.event.eventDate).toISOString()
            : '',
          registration.event?.venue || '',
          new Date(registration.updatedAt || registration.createdAt).toISOString()
        ])
      );
      filename = 'attendance-report.csv';
    } else if (reportType === 'notifications') {
      const notifications = await Notification.find(createdAtFilter)
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email')
        .populate('community', 'name')
        .populate('event', 'title')
        .lean();

      csv = createCsv(
        [
          'Notification ID',
          'Title',
          'Type',
          'Audience Type',
          'Audience Label',
          'Community',
          'Event',
          'Recipients',
          'Status',
          'Email Status',
          'Created By',
          'Created At'
        ],
        notifications.map((notification) => [
          notification._id,
          notification.title,
          notification.type,
          notification.audienceType,
          notification.audienceLabel,
          notification.community?.name || '',
          notification.event?.title || '',
          notification.recipientsCount,
          notification.status,
          notification.emailStatus,
          notification.createdBy?.email || notification.createdBy?.name || '',
          new Date(notification.createdAt).toISOString()
        ])
      );
      filename = 'notifications-report.csv';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (error) {
    const status = error.message.includes('invalid') ? 400 : 500;

    return res.status(status).json({
      message: 'Unable to export report right now.',
      details: error.message
    });
  }
}
