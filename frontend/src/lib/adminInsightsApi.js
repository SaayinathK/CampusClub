import { apiRequest } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function getDashboardOverview(token) {
  return apiRequest('/admin/dashboard-overview', {
    method: 'GET',
    token
  });
}

export function getAnalyticsSummary(token) {
  return apiRequest('/admin/analytics-summary', {
    method: 'GET',
    token
  });
}

export function getReportsSummary(token, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return apiRequest(`/admin/reports-summary${suffix}`, {
    method: 'GET',
    token
  });
}

export async function exportReport(type, token, params = {}) {
  const searchParams = new URLSearchParams({ type });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const response = await fetch(
    `${API_BASE_URL}/admin/reports-export?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Unable to export report.');
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('Content-Disposition') || '';
  const match = contentDisposition.match(/filename="([^"]+)"/i);

  return {
    blob,
    filename: match?.[1] || `${type}-report.csv`
  };
}
