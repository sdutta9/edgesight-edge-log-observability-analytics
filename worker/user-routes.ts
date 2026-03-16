import { Hono } from "hono";
import type { Env } from './core-utils';
import { LogEntryEntity, MetricRollupEntity } from "./entities";
import { ok, bad, isStr } from './core-utils';
import { LogEvent } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // LOG INGESTION
  app.post('/api/logs', async (c) => {
    const log = (await c.req.json()) as LogEvent;
    if (!log.rayId || !log.path || !log.method) {
      return bad(c, 'Invalid log payload');
    }
    const timestamp = log.timestamp || Date.now();
    const enrichedLog = { ...log, timestamp };
    // 1. Store the raw log
    await LogEntryEntity.create(c.env, enrichedLog);
    // 2. Update aggregate metrics rollups
    await MetricRollupEntity.recordRequest(c.env, enrichedLog);
    return ok(c, { ingested: true, rayId: enrichedLog.rayId });
  });
  // LOG RETRIEVAL
  app.get('/api/logs', async (c) => {
    await LogEntryEntity.ensureSeed(c.env);
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 50;
    const page = await LogEntryEntity.list(c.env, cursor, limit);
    // Sort by timestamp descending
    page.items.sort((a, b) => b.timestamp - a.timestamp);
    return ok(c, page);
  });
  // METRICS RETRIEVAL
  app.get('/api/metrics', async (c) => {
    await MetricRollupEntity.ensureSeed(c.env);
    const page = await MetricRollupEntity.list(c.env, null, 100);
    // Sort by timestamp ascending for charts
    const sortedMetrics = page.items.sort((a, b) => a.timestamp - b.timestamp);
    return ok(c, sortedMetrics);
  });
  // SYSTEM STATS
  app.get('/api/stats/health', (c) => {
    return ok(c, {
      status: 'operational',
      region: 'WAF-EDGE-1',
      uptime: process.uptime(),
      timestamp: Date.now()
    });
  });
}