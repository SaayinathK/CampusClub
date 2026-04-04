import mongoose from 'mongoose';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const AUTH_ROLES = ['admin', 'student'];
export const COMMUNITY_STATUSES = ['Active', 'Pending'];
export const EVENT_STATUSES = ['Published', 'Draft', 'Completed'];
export const NOTIFICATION_TYPES = ['Event Update', 'Reminder', 'Alert', 'System'];
export const NOTIFICATION_AUDIENCES = [
  'All Students',
  'Specific Community',
  'Event Registrants'
];
export const REGISTRATION_STATUSES = ['Registered', 'Attended', 'Cancelled'];
export const REPORT_TYPES = [
  'registrations',
  'events',
  'communities',
  'attendance',
  'notifications'
];

export function normalizeText(value) {
  return String(value ?? '').trim();
}

function validateRequiredText(value, label, options = {}) {
  const normalized = normalizeText(value);
  const { minLength = 1, maxLength } = options;

  if (!normalized) {
    return `${label} is required.`;
  }

  if (normalized.length < minLength) {
    return `${label} must be at least ${minLength} characters long.`;
  }

  if (maxLength && normalized.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }

  return null;
}

function validateOptionalEnum(value, allowedValues, label) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  if (!allowedValues.includes(normalized)) {
    return `${label} is invalid.`;
  }

  return null;
}

function validateNonNegativeInteger(value, label) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsedValue = Number(normalized);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return `${label} must be a whole number zero or greater.`;
  }

  return null;
}

export function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(normalizeText(value));
}

export function validateObjectId(value, label) {
  if (!isValidObjectId(value)) {
    return `${label} is invalid.`;
  }

  return null;
}

export function validateAuthPayload({ name, email, password, role }, isRegister) {
  if (isRegister) {
    const nameError = validateRequiredText(name, 'Name', {
      minLength: 2,
      maxLength: 80
    });

    if (nameError) {
      return nameError;
    }
  }

  const emailValue = normalizeText(email);

  if (!emailValue) {
    return 'Email is required.';
  }

  if (!EMAIL_REGEX.test(emailValue)) {
    return 'Email address is invalid.';
  }

  const passwordValue = String(password ?? '');

  if (!passwordValue.trim()) {
    return 'Password is required.';
  }

  if (passwordValue.trim().length < 6) {
    return 'Password must be at least 6 characters long.';
  }

  if (passwordValue.length > 128) {
    return 'Password must be 128 characters or fewer.';
  }

  if (!AUTH_ROLES.includes(role)) {
    return 'Role must be admin or student.';
  }

  return null;
}

export function validateCommunityPayload(body) {
  const nameError = validateRequiredText(body.name, 'Community name', {
    minLength: 2,
    maxLength: 80
  });

  if (nameError) {
    return nameError;
  }

  const presidentError = validateRequiredText(body.president, 'President name', {
    minLength: 2,
    maxLength: 80
  });

  if (presidentError) {
    return presidentError;
  }

  const categoryError = validateRequiredText(body.category, 'Category', {
    minLength: 2,
    maxLength: 50
  });

  if (categoryError) {
    return categoryError;
  }

  const descriptionError = validateRequiredText(body.description, 'Description', {
    minLength: 10,
    maxLength: 1000
  });

  if (descriptionError) {
    return descriptionError;
  }

  const memberCountError = validateNonNegativeInteger(body.memberCount, 'Member count');

  if (memberCountError) {
    return memberCountError;
  }

  const eventCountError = validateNonNegativeInteger(body.eventCount, 'Event count');

  if (eventCountError) {
    return eventCountError;
  }

  const statusError = validateOptionalEnum(body.status, COMMUNITY_STATUSES, 'Community status');

  if (statusError) {
    return statusError;
  }

  return null;
}

export function validateEventPayload(body) {
  const titleError = validateRequiredText(body.title, 'Event title', {
    minLength: 3,
    maxLength: 120
  });

  if (titleError) {
    return titleError;
  }

  const descriptionError = validateRequiredText(body.description, 'Description', {
    minLength: 10,
    maxLength: 2000
  });

  if (descriptionError) {
    return descriptionError;
  }

  if (!normalizeText(body.eventDate)) {
    return 'Event date is required.';
  }

  const eventDate = new Date(`${normalizeText(body.eventDate)}T12:00:00.000Z`);

  if (Number.isNaN(eventDate.getTime())) {
    return 'Event date is invalid.';
  }

  const timeValue = normalizeText(body.time);

  if (!timeValue) {
    return 'Event time is required.';
  }

  if (!TIME_REGEX.test(timeValue)) {
    return 'Event time is invalid.';
  }

  const venueError = validateRequiredText(body.venue, 'Venue', {
    minLength: 2,
    maxLength: 120
  });

  if (venueError) {
    return venueError;
  }

  const categoryError = validateRequiredText(body.category, 'Category', {
    minLength: 2,
    maxLength: 60
  });

  if (categoryError) {
    return categoryError;
  }

  if (!normalizeText(body.communityId)) {
    return 'Community is required.';
  }

  const communityError = validateObjectId(body.communityId, 'Community');

  if (communityError) {
    return communityError;
  }

  const parsedCapacity = Number(body.capacity);

  if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
    return 'Capacity must be at least 1.';
  }

  if (parsedCapacity > 100000) {
    return 'Capacity must be 100000 or fewer.';
  }

  const statusError = validateOptionalEnum(body.status, EVENT_STATUSES, 'Event status');

  if (statusError) {
    return statusError;
  }

  return null;
}

export function validateNotificationPayload(body) {
  const titleError = validateRequiredText(body.title, 'Notification title', {
    minLength: 3,
    maxLength: 120
  });

  if (titleError) {
    return titleError;
  }

  const messageError = validateRequiredText(body.message, 'Notification message', {
    minLength: 10,
    maxLength: 2000
  });

  if (messageError) {
    return messageError;
  }

  const audienceType = normalizeText(body.audienceType);

  if (!NOTIFICATION_AUDIENCES.includes(audienceType)) {
    return 'Audience type is invalid.';
  }

  const typeError = validateOptionalEnum(body.type, NOTIFICATION_TYPES, 'Notification type');

  if (typeError) {
    return typeError;
  }

  if (audienceType === 'Specific Community') {
    if (!normalizeText(body.communityId)) {
      return 'A community is required.';
    }

    const communityError = validateObjectId(body.communityId, 'Community');

    if (communityError) {
      return communityError;
    }
  }

  if (audienceType === 'Event Registrants') {
    if (!normalizeText(body.eventId)) {
      return 'An event is required.';
    }

    const eventError = validateObjectId(body.eventId, 'Event');

    if (eventError) {
      return eventError;
    }
  }

  return null;
}

export function validateRegistrationPayload(body) {
  if (!normalizeText(body.eventId)) {
    return 'Event is required.';
  }

  return validateObjectId(body.eventId, 'Event');
}

export function validateRegistrationStatus(value) {
  if (!REGISTRATION_STATUSES.includes(normalizeText(value))) {
    return 'Registration status is invalid.';
  }

  return null;
}

export function validateReportFilters(query) {
  const fromDateValue = normalizeText(query.fromDate);
  const toDateValue = normalizeText(query.toDate);
  let fromDate = null;
  let toDate = null;

  if (fromDateValue) {
    fromDate = new Date(fromDateValue);

    if (Number.isNaN(fromDate.getTime())) {
      return 'From date is invalid.';
    }
  }

  if (toDateValue) {
    toDate = new Date(toDateValue);

    if (Number.isNaN(toDate.getTime())) {
      return 'To date is invalid.';
    }
  }

  if (fromDate && toDate && fromDate > toDate) {
    return 'From date cannot be after To date.';
  }

  return null;
}

export function validateReportType(type) {
  if (!REPORT_TYPES.includes(normalizeText(type))) {
    return 'Report type is invalid.';
  }

  return null;
}
