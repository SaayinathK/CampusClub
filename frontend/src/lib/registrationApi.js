import { apiRequest } from './api';

export function createRegistration(eventId, token) {
  return apiRequest('/registrations', {
    method: 'POST',
    body: { eventId },
    token
  });
}

export function getMyRegistrations(token, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return apiRequest(`/registrations/me${suffix}`, {
    method: 'GET',
    token
  });
}

export function cancelRegistration(registrationId, token) {
  return apiRequest(`/registrations/${registrationId}/cancel`, {
    method: 'PATCH',
    token
  });
}

export function getAllRegistrations(token) {
  return apiRequest('/registrations', {
    method: 'GET',
    token
  });
}

export function updateRegistrationStatus(registrationId, status, token) {
  return apiRequest(`/registrations/${registrationId}/status`, {
    method: 'PATCH',
    body: { status },
    token
  });
}
