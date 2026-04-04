import { apiRequest } from './api';

export function getCommunities(token) {
  return apiRequest('/communities', {
    method: 'GET',
    token
  });
}

export function createCommunity(payload, token) {
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

  return apiRequest('/communities', {
    method: 'POST',
    body: formData,
    token
  });
}

export function updateCommunity(communityId, payload, token) {
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

  return apiRequest(`/communities/${communityId}`, {
    method: 'PUT',
    body: formData,
    token
  });
}

export function deleteCommunity(communityId, token) {
  return apiRequest(`/communities/${communityId}`, {
    method: 'DELETE',
    token
  });
}
