export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface LogEvent {
  id: string;
  timestamp: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  path: string;
  status: number;
  latency: number;
  ip: string;
  rayId: string;
  userAgent: string;
}
export interface MetricSummary {
  timestamp: number;
  totalRequests: number;
  errorCount: number;
  p90Latency: number;
  bandwidth: number; // in bytes
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}