"use client";

import { CheckCircle2, ArrowRight, Radio, ShieldCheck, Activity, Cpu, Layers } from "lucide-react";

interface Stage {
  id: string;
  name: string;
  stream: string;
  status: "ok" | "idle" | "error";
  latency: string;
  agent: string;
}

const stages: Stage[] = [
  { id: "1", name: "Telemetry Ingestion", stream: "Webhook / Profiler", status: "ok", latency: "<10ms", agent: "Gateway" },
  { id: "2", name: "Event Bus Routing", stream: "healerdb:events", status: "ok", latency: "1ms", agent: "Redis 7.2" },
  { id: "3", name: "Root Cause Diagnosis", stream: "healerdb:repair", status: "ok", latency: "420ms", agent: "Groq Llama 3.3" },
  { id: "4", name: "Sandbox Simulation", stream: "Ephem-Postgres", status: "ok", latency: "850ms", agent: "Testcontainers" },
  { id: "5", name: "Transactional Apply", stream: "healerdb:apply", status: "ok", latency: "15ms", agent: "Atomic Executor" },
];

export function PipelineStream() {
  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono">
      <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#cbd5e1] text-xs font-semibold">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Real-time Self-Healing Pipeline (5 Stages)</span>
        </div>
        <span className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
          <Radio className="w-3 h-3 animate-pulse" />
          STREAM HEALTHY
        </span>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-[700px]">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-3 flex-1">
              <div className="flex-1 bg-[#13131d] border border-[#2b2b3d] hover:border-blue-500/50 p-3 rounded-lg transition-colors group">
                <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-1">
                  <span>STAGE {stage.id}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h4 className="text-xs font-semibold text-[#e2e8f0] group-hover:text-blue-400 transition-colors truncate">
                  {stage.name}
                </h4>
                <p className="text-[10px] text-blue-400 mt-1 truncate">
                  {stage.stream}
                </p>
                <div className="mt-2 pt-2 border-t border-[#1e1e2e] flex items-center justify-between text-[10px] text-[#94a3b8]">
                  <span>{stage.agent}</span>
                  <span className="text-slate-400">{stage.latency}</span>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <ArrowRight className="w-4 h-4 text-[#64748b] shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
