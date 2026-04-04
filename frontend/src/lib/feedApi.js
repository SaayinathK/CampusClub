import { apiRequest } from './api';

export function getStudentFeed(token) {
  return apiRequest('/feed/student', {
    method: 'GET',
    token
  });
}
