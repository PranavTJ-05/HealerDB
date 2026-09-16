/**
 * Centralised API client for the HealerDB backend (FastAPI @ port 8001).
 * All fetch calls are proxied via Next.js rewrites so the frontend only
 * ever hits the same origin and avoids CORS issues in development.
 */

const BASE = "/api";

// ─── Generic helpers ─────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error ${res.status} on GET ${path}`);
  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Anomaly {
  id: string;
  table_name: string;
  column_name: string;
  anomaly_type: string;
  severity: "critical" | "warning" | "info";
  detected_at: string;
  value: string | number | null;
  expected_range?: string;
  status: "open" | "pending" | "resolved";
}

export interface ColumnProfile {
  column_name: string;
  data_type: string;
  null_count: number;
  null_pct: number;
  distinct_count: number;
  min: string | number | null;
  max: string | number | null;
  mean: string | number | null;
  stddev: string | number | null;
}

export interface TableProfile {
  table_name: string;
  row_count: number;
  column_count: number;
  columns: ColumnProfile[];
  profiled_at: string;
}

export interface Proposal {
  id: string;
  anomaly_id: string;
  table_name: string;
  column_name: string;
  strategy: string;
  sql_patch: string;
  sandbox_passed: boolean;
  created_at: string;
  status: "pending" | "approved" | "rejected" | "applied";
  risk_level: "low" | "medium" | "high";
}

export interface AuditEntry {
  id: string;
  proposal_id: string;
  table_name: string;
  column_name: string;
  action: string;
  applied_at: string;
  applied_by: string;
  rows_affected: number;
  rollback_available: boolean;
}

export interface DashboardStats {
  monitored_tables: number;
  table_names: string[];
  active_anomalies: number;
  critical_anomalies: number;
  warning_anomalies: number;
  pending_proposals: number;
  self_healed_records: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  stream: string;
  status: "ok" | "idle" | "error";
  latency_ms: number;
  agent: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  target: string;
  status: "success" | "running" | "waiting" | "error";
}

// ─── API calls ───────────────────────────────────────────────────────────────

export const api = {
  /** Summary KPIs for the dashboard stat grid */
  getDashboardStats: () => get<DashboardStats>("/health/summary"),

  /** 5-stage pipeline status */
  getPipelineStatus: () => get<PipelineStage[]>("/health/pipeline"),

  /** Live agent log stream (latest N entries) */
  getAgentLogs: (limit = 20) => get<AgentLog[]>(`/health/agent-logs?limit=${limit}`),

  /** Statistical profiling results for all tables */
  getProfiles: () => get<TableProfile[]>("/profiler/profiles"),

  /** Profiling result for a single table */
  getProfile: (table: string) => get<TableProfile>(`/profiler/profiles/${table}`),

  /** All detected anomalies */
  getAnomalies: () => get<Anomaly[]>("/anomalies"),

  /** All remediation proposals */
  getProposals: () => get<Proposal[]>("/proposals"),

  /** Approve a proposal */
  approveProposal: (id: string) =>
    fetch(`${BASE}/proposals/${id}/approve`, { method: "POST" }).then((r) => r.json()),

  /** Reject a proposal */
  rejectProposal: (id: string) =>
    fetch(`${BASE}/proposals/${id}/reject`, { method: "POST" }).then((r) => r.json()),

  /** Full audit log */
  getAuditLog: () => get<AuditEntry[]>("/audit"),
};
