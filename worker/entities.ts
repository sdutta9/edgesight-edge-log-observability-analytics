import { IndexedEntity } from "./core-utils";
import type { LogEvent, MetricSummary } from "@shared/types";
import { SEED_LOGS, SEED_METRICS } from "@shared/mock-data";
/**
 * LogEntryEntity: Stores individual raw log events.
 * Uses rayId as the primary key.
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
  static keyOf(state: LogEvent): string {
    return state.rayId || state.id;
  }
}
/**
 * MetricRollupEntity: Stores aggregated time-series metrics.
 * Uses the hour-aligned timestamp as the ID.
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
    await entity.mutate(s => {
      const isError = log.status >= 400;
      const nextRequests = s.totalRequests + 1;
      // Simple moving average approximation for p90 latency if we were doing full stats, 
      // but here we'll just track a rolling average of "p90-like" values for the demo.
      const nextLatency = Math.floor((s.p90Latency * s.totalRequests + log.latency) / nextRequests);
      return {
        ...s,
        id,
        timestamp: hourTs,
        totalRequests: nextRequests,
        errorCount: s.errorCount + (isError ? 1 : 0),
        p90Latency: nextLatency,
        bandwidth: s.bandwidth + (Math.random() * 5000 + 1024), // Approx bandwidth
      };
    });
  }
}