import type { RequestHandler } from 'msw';
import { HttpResponse, http } from 'msw';
import { ANALYTICS_ENDPOINTS } from '@/lib/analytics/endpoints.config';
import { mockHandlers } from '@/mocks/handlers';

export const apiHandlers: RequestHandler[] = [
  // Handle GET /api/analytics (health check)
  http.get('/api/analytics', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: Date.now(),
    });
  }),

  // Handle POST /api/analytics (event tracking)
  http.post('/api/analytics', () => {
    return HttpResponse.json({
      success: true,
    });
  }),
];

export const analyticsHandlers: RequestHandler[] = [
  http.get(`${ANALYTICS_ENDPOINTS.AMPLITUDE.CONFIG}/config/*`, () => {
    return HttpResponse.json({
      config: {
        analyticsOptions: {
          pageViews: true,
          sessions: true,
          formInteractions: false,
          fileDownloads: false,
        },
      },
    });
  }),

  http.post(`${ANALYTICS_ENDPOINTS.AMPLITUDE.API}/2/httpapi`, () => {
    return HttpResponse.json({
      code: 200,
      events_ingested: 1,
      payload_size_bytes: 100,
      server_upload_time: Date.now(),
    });
  }),
];

export const handlers = [...apiHandlers, ...analyticsHandlers, ...mockHandlers];
