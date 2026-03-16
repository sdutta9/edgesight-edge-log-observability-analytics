import { IndexedEntity } from "./core-utils";
import type { LogEvent, MetricSummary } from "@shared/types";
import { SEED_LOGS, SEED_METRICS } from "@shared/mock-data";
/**
 * LogEntryEntity: Stores individual raw log events.
 */
export class LogEntryEntity extends IndexedEntity<LogEvent> {
  static readonly entityName = "log_entry";
  static readonly indexName = "logs";
  static readonly initialState: LogEvent = {
    id: "",
    timestamp: 0,
    method: "GET",
    path: "",
    status: 200,
    latency: 0,
    ip: "",
    rayId: "",
    userAgent: ""
  };
  static seedData = SEED_LOGS;
  // Use a wider parameter type to match IndexedEntity constraint and cast internally
  static override keyOf<U extends { id: string }>(state: U): string {
    const s = state as unknown as LogEvent;
    return s.rayId || s.id;
  }
}
/**
 * MetricRollupEntity: Stores aggregated time-series metrics.
 */
export class MetricRollupEntity extends IndexedEntity<MetricSummary & { id: string }> {
  static readonly entityName = "metric_rollup";
  static readonly indexName = "metrics";
  static readonly initialState: MetricSummary & { id: string } = {
    id: "",
    timestamp: 0,
    totalRequests: 0,
    errorCount: 0,
    p90Latency: 0,
    bandwidth: 0
  };
  static seedData = SEED_METRICS.map(m => ({ ...m, id: String(m.timestamp) }));
  static async recordRequest(env: any, log: LogEvent): Promise<void> {
    const hourTs = new Date(log.timestamp).setMinutes(0, 0, 0);
    const id = String(hourTs);
    const entity = new MetricRollupEntity(env, id);
    // Ensure latency is non-negative
    const safeLatency = Math.max(0, log.latency);
    await entity.mutate(s => {
      const isError = log.status >= 400;
      const nextRequests = s.totalRequests + 1;
      // Moving average for p90 estimation
      const nextLatency = Math.floor((s.p90Latency * s.totalRequests + safeLatency) / nextRequests);
      return {
        ...s,
        id,
        timestamp: hourTs,
        totalRequests: nextRequests,
        errorCount: s.errorCount + (isError ? 1 : 0),
        p90Latency: nextLatency,
        bandwidth: s.bandwidth + (Math.random() * 5000 + 1024),
      };
    });
  }
}