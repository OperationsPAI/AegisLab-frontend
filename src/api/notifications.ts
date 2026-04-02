/**
 * Create SSE connection for real-time notifications
 * Backend endpoint: GET /notifications/stream
 */
export const createNotificationStream = (): EventSource => {
  const token = localStorage.getItem('access_token');
  const url = `/api/v2/notifications/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  return new EventSource(url);
};
