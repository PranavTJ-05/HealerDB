"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type PipelineStage } from "@/lib/api";
import {
  CheckCircle2,
  ArrowRight,
  Radio,
  Activity,
  AlertTriangle,
  Minus,
} from "lucide-react";

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  PipelineStage["status"],
  { icon: React.ReactNode; badge: string; border: string; latency: string }
> = {
  ok: {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    badge: "text-emerald-400 STREAM HEALTHY",
    border: "border-[#2b2b3d] hover:border-blue-500/50",
    latency: "text-emerald-400",
  },
  idle: {
    icon: <Minus className="w-3.5 h-3.5 text-[#64748b]" />,
    badge: "text-[#64748b] IDLE",
    border: "border-[#2b2b3d]",
    latency: "text-[#64748b]",
  },
  error: {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
    badge: "text-rose-400 DEGRADED",
    border: "border-rose-500/50",
    latency: "text-rose-400",
  },
};

// Fallback stages for when the backend is offline
const FALLBACK_STAGES: PipelineStage[] = [
  { id: "1", name: "Telemetry Ingestion",  stream: "Webhook / Profiler",  status: "idle", latency_ms: 0,   agent: "Gateway" },
  { id: "2", name: "Event Bus Routing",    stream: "healerdb:events",     status: "idle", latency_ms: 0,   agent: "Redis 7.2" },
  { id: "3", name: "Root Cause Diagnosis", stream: "healerdb:repair",     status: "idle", latency_ms: 0,   agent: "Groq Llama 3.3" },
  { id: "4", name: "Sandbox Simulation",   stream: "Ephem-Postgres",      status: "idle", latency_ms: 0,   agent: "Testcontainers" },
  { id: "5", name: "Transactional Apply",  stream: "healerdb:apply",      status: "idle", latency_ms: 0,   agent: "Atomic Executor" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function PipelineStream() {
  const { data, isLoading, isError } = useQuery<PipelineStage[]>({
    queryKey: ["pipeline-status"],
    queryFn: api.getPipelineStatus,
  });

  const stages = data ?? FALLBACK_STAGES;
  const allHealthy = stages.every((s) => s.status === "ok");
  const hasError   = stages.some((s) => s.status === "error");

  const streamLabel = isLoading
    ? "CHECKING…"
    : hasError
    ? "DEGRADED"
    : allHealthy
    ? "STREAM HEALTHY"
    : "PARTIAL";

  const streamColor = isLoading
    ? "text-[#64748b]"
    : hasError
    ? "text-rose-400"
    : allHealthy
    ? "text-emerald-400"
    : "text-amber-400";

  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono">
      <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#cbd5e1] text-xs font-semibold">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Real-time Self-Healing Pipeline (5 Stages)</span>
        </div>
        <span className={`flex items-center gap-1.5 text-[10px] ${streamColor}`}>
          <Radio className="w-3 h-3 animate-pulse" />
          {streamLabel}
        </span>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-[700px]">
          {stages.map((stage, idx) => {
            const s = STATUS_STYLES[stage.status];
            return (
              <div key={stage.id} className="flex items-center gap-3 flex-1">
                <div
                  className={`flex-1 bg-[#13131d] border ${s.border} p-3 rounded-lg transition-colors group`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-1">
                    <span>STAGE {stage.id}</span>
                    {s.icon}
                  </div>
                  <h4 className="text-xs font-semibold text-[#e2e8f0] group-hover:text-blue-400 transition-colors truncate">
                    {stage.name}
                  </h4>
                  <p className="text-[10px] text-blue-400 mt-1 truncate">{stage.stream}</p>
                  <div className="mt-2 pt-2 border-t border-[#1e1e2e] flex items-center justify-between text-[10px] text-[#94a3b8]">
                    <span>{stage.agent}</span>
                    <span className={s.latency}>
                      {stage.latency_ms > 0 ? `${stage.latency_ms}ms` : "--"}
                    </span>
                  </div>
                </div>

                {idx < stages.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#64748b] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
