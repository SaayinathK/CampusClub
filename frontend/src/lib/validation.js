const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const AUTH_ROLES = ['student', 'admin'];
const COMMUNITY_STATUSES = ['Active', 'Pending'];
const EVENT_STATUSES = ['Published', 'Draft', 'Completed'];
const NOTIFICATION_TYPES = ['Event Update', 'Reminder', 'Alert', 'System'];
const NOTIFICATION_AUDIENCES = [
  'All Students',
  'Specific Community',
  'Event Registrants'
];

function normalizeText(value) {
  return String(value ?? '').trim();
}

function setError(errors, fieldName, message) {
  if (!errors[fieldName]) {
    errors[fieldName] = message;
  }
}

function validateRequiredText(errors, fieldName, value, label, options = {}) {
  const normalized = normalizeText(value);
  const { minLength = 1, maxLength } = options;

  if (!normalized) {
    setError(errors, fieldName, `${label} is required.`);
    return;
  }

  if (normalized.length < minLength) {
    setError(errors, fieldName, `${label} must be at least ${minLength} characters long.`);
    return;
  }

  if (maxLength && normalized.length > maxLength) {
    setError(errors, fieldName, `${label} must be ${maxLength} characters or fewer.`);
  }
}

function validateImageFile(errors, fieldName, file) {
  if (!file) {
    return;
  }

  if (file.type && !file.type.startsWith('image/')) {
    setError(errors, fieldName, 'Only image files are allowed.');
    return;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    setError(errors, fieldName, 'Image must be 5MB or smaller.');
  }
}

export function hasValidationErrors(errors) {
  return Object.values(errors).some(Boolean);
}

export function getFirstValidationError(errors) {
  return Object.values(errors).find(Boolean) || 'Please fix the highlighted fields.';
}

export function validateAuthForm(values, options = {}) {
  const { mode = 'login', role = '' } = options;
  const errors = {};

  if (mode === 'register') {
    validateRequiredText(errors, 'name', values.name, 'Full name', {
      minLength: 2,
      maxLength: 80
    });
  }

  const email = normalizeText(values.email);

  if (!email) {
    setError(errors, 'email', 'Email is required.');
  } else if (!EMAIL_REGEX.test(email)) {
    setError(errors, 'email', 'Email address is invalid.');
  }

  const password = String(values.password ?? '');

  if (!password.trim()) {
    setError(errors, 'password', 'Password is required.');
  } else if (password.trim().length < 6) {
    setError(errors, 'password', 'Password must be at least 6 characters long.');
  } else if (password.length > 128) {
    setError(errors, 'password', 'Password must be 128 characters or fewer.');
  }

  if (mode === 'register') {
    if (!String(values.confirmPassword ?? '').trim()) {
      setError(errors, 'confirmPassword', 'Confirm password is required.');
    } else if (values.password !== values.confirmPassword) {
      setError(errors, 'confirmPassword', 'Passwords do not match.');
    }
  }

  if (!AUTH_ROLES.includes(role)) {
    setError(errors, 'role', 'Selected role is invalid.');
  }

  return errors;
}

export function validateCommunityForm(values) {
  const errors = {};

  validateRequiredText(errors, 'name', values.name, 'Community name', {
    minLength: 2,
    maxLength: 80
  });
  validateRequiredText(errors, 'president', values.president, 'President name', {
    minLength: 2,
    maxLength: 80
  });
  validateRequiredText(errors, 'category', values.category, 'Category', {
    minLength: 2,
    maxLength: 50
  });
  validateRequiredText(errors, 'description', values.description, 'Description', {
    minLength: 10,
    maxLength: 1000
  });

  const memberCount = Number(values.memberCount);

  if (!Number.isInteger(memberCount) || memberCount < 0) {
    setError(errors, 'memberCount', 'Member count must be a whole number zero or greater.');
  }

  const eventCount = Number(values.eventCount);

  if (!Number.isInteger(eventCount) || eventCount < 0) {
    setError(errors, 'eventCount', 'Event count must be a whole number zero or greater.');
  }

  if (!COMMUNITY_STATUSES.includes(values.status)) {
    setError(errors, 'status', 'Community status is invalid.');
  }

  validateImageFile(errors, 'image', values.image);

  return errors;
}

export function validateEventForm(values) {
  const errors = {};

  validateRequiredText(errors, 'title', values.title, 'Event title', {
    minLength: 3,
    maxLength: 120
  });
  validateRequiredText(errors, 'description', values.description, 'Description', {
    minLength: 10,
    maxLength: 2000
  });
  validateRequiredText(errors, 'venue', values.venue, 'Venue', {
    minLength: 2,
    maxLength: 120
  });
  validateRequiredText(errors, 'category', values.category, 'Category', {
    minLength: 2,
    maxLength: 60
  });

  if (!normalizeText(values.eventDate)) {
    setError(errors, 'eventDate', 'Event date is required.');
  } else if (Number.isNaN(new Date(`${values.eventDate}T12:00:00.000Z`).getTime())) {
    setError(errors, 'eventDate', 'Event date is invalid.');
  }

  const time = normalizeText(values.time);

  if (!time) {
    setError(errors, 'time', 'Event time is required.');
  } else if (!TIME_REGEX.test(time)) {
    setError(errors, 'time', 'Event time is invalid.');
  }

  if (!normalizeText(values.communityId)) {
    setError(errors, 'communityId', 'Community is required.');
  }

  const capacity = Number(values.capacity);

  if (!Number.isInteger(capacity) || capacity < 1) {
    setError(errors, 'capacity', 'Capacity must be at least 1.');
  } else if (capacity > 100000) {
    setError(errors, 'capacity', 'Capacity must be 100000 or fewer.');
  }

  if (!EVENT_STATUSES.includes(values.status)) {
    setError(errors, 'status', 'Event status is invalid.');
  }

  validateImageFile(errors, 'image', values.image);

  return errors;
}

export function validateNotificationForm(values) {
  const errors = {};

  validateRequiredText(errors, 'title', values.title, 'Notification title', {
    minLength: 3,
    maxLength: 120
  });
  validateRequiredText(errors, 'message', values.message, 'Notification message', {
    minLength: 10,
    maxLength: 2000
  });

  if (!NOTIFICATION_AUDIENCES.includes(values.audienceType)) {
    setError(errors, 'audienceType', 'Target audience is invalid.');
  }

  if (!NOTIFICATION_TYPES.includes(values.type)) {
    setError(errors, 'type', 'Notification type is invalid.');
  }

  if (values.audienceType === 'Specific Community' && !normalizeText(values.communityId)) {
    setError(errors, 'communityId', 'Please select a community.');
  }

  if (values.audienceType === 'Event Registrants' && !normalizeText(values.eventId)) {
    setError(errors, 'eventId', 'Please select an event.');
  }

  return errors;
}

export function validateReportFilters(filters) {
  const errors = {};
  const fromDate = normalizeText(filters.fromDate);
  const toDate = normalizeText(filters.toDate);
  let fromDateValue = null;
  let toDateValue = null;

  if (fromDate) {
    fromDateValue = new Date(fromDate);

    if (Number.isNaN(fromDateValue.getTime())) {
      setError(errors, 'fromDate', 'From date is invalid.');
    }
  }

  if (toDate) {
    toDateValue = new Date(toDate);

    if (Number.isNaN(toDateValue.getTime())) {
      setError(errors, 'toDate', 'To date is invalid.');
    }
  }

  if (fromDateValue && toDateValue && fromDateValue > toDateValue) {
    setError(errors, 'toDate', 'To date cannot be earlier than From date.');
  }

  return errors;
}
