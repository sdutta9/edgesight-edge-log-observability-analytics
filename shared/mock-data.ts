import { LogEvent, MetricSummary, User, Chat, ChatMessage } from './types';
const PATHS = ['/api/v1/user', '/api/v1/auth', '/api/v1/data', '/api/v1/status', '/login', '/', '/dashboard'];
const METHODS: Array<LogEvent['method']> = ['GET', 'POST', 'GET', 'GET', 'PUT', 'DELETE'];
const STATUSES = [200, 200, 200, 201, 204, 400, 401, 403, 404, 500, 502];
export const generateMockLogs = (count: number): LogEvent[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `log-${i}-${Math.random().toString(36).substring(7)}`,
    timestamp: Date.now() - Math.floor(Math.random() * 3600000), // Last hour
    method: METHODS[Math.floor(Math.random() * METHODS.length)],
    path: PATHS[Math.floor(Math.random() * PATHS.length)],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    latency: Math.floor(Math.random() * 450) + 20,
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1.1`,
    rayId: Math.random().toString(36).substring(2, 15).toUpperCase(),
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  })).sort((a, b) => b.timestamp - a.timestamp);
};
export const generateMockMetrics = (hours: number = 24): MetricSummary[] => {
  const now = Date.now();
  return Array.from({ length: hours }).map((_, i) => {
    // Align to the start of the hour
    const ts = new Date(now - (hours - i) * 3600000).setMinutes(0, 0, 0);
    const baseRequests = 500 + Math.floor(Math.random() * 1000);
    return {
      timestamp: ts,
      totalRequests: baseRequests,
      errorCount: Math.floor(baseRequests * (Math.random() * 0.05)),
      p90Latency: 120 + Math.floor(Math.random() * 200),
      bandwidth: baseRequests * (1024 + Math.floor(Math.random() * 5000)),
    };
  });
};
export const SEED_LOGS: LogEvent[] = generateMockLogs(20);
export const SEED_METRICS: MetricSummary[] = generateMockMetrics(24);
export const MOCK_USERS: User[] = [{ id: 'u1', name: 'Admin' }];
export const MOCK_CHATS: Chat[] = [{ id: 'c1', title: 'System' }];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [];