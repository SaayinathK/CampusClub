import { apiRequest } from './api';

export function getEvents(token, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return apiRequest(`/events${suffix}`, {
    method: 'GET',
    token
  });
}

export function getEventById(eventId, token) {
  return apiRequest(`/events/${eventId}`, {
    method: 'GET',
    token
  });
}

export function createEvent(payload, token) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'image') {
      if (value) {
        formData.append('image', value);
      }

      return;
    }

    formData.append(key, value);
  });

  return apiRequest('/events', {
    method: 'POST',
    body: formData,
    token
  });
}

export function updateEvent(eventId, payload, token) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'image') {
      if (value) {
        formData.append('image', value);
      }

      return;
    }

    formData.append(key, value);
  });

  return apiRequest(`/events/${eventId}`, {
    method: 'PUT',
    body: formData,
    token
  });
}

export function deleteEvent(eventId, token) {
  return apiRequest(`/events/${eventId}`, {
    method: 'DELETE',
    token
  });
}
