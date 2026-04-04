import { apiRequest } from './api';

export function createNotification(payload, token) {
  return apiRequest('/notifications', {
    method: 'POST',
    body: payload,
    token
  });
}

export function getAdminNotifications(token) {
  return apiRequest('/notifications/admin', {
    method: 'GET',
    token
  });
}

export function getMyNotifications(token) {
  return apiRequest('/notifications/me', {
    method: 'GET',
    token
  });
}

export function markNotificationAsRead(notificationId, token) {
  return apiRequest(`/notifications/me/${notificationId}/read`, {
    method: 'PATCH',
    token
  });
}

export function markAllNotificationsAsRead(token) {
  return apiRequest('/notifications/me/read-all', {
    method: 'PATCH',
    token
  });
}

export function deleteNotification(notificationId, token) {
  return apiRequest(`/notifications/me/${notificationId}`, {
    method: 'DELETE',
    token
  });
}
