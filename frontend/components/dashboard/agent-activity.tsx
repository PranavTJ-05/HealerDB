"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type AgentLog } from "@/lib/api";
import { Terminal, CheckCircle2, Loader2, Clock, AlertTriangle } from "lucide-react";

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AgentLog["status"],
  { dot: string; label: string; text: string }
> = {
  success: { dot: "bg-emerald-400", label: "Done",    text: "text-emerald-400" },
  running: { dot: "bg-blue-400 animate-ping",   label: "Running", text: "text-blue-400" },
  waiting: { dot: "bg-amber-400",  label: "Waiting", text: "text-amber-400" },
  error:   { dot: "bg-rose-400",   label: "Error",   text: "text-rose-400" },
};

// Fallback log entries shown when backend is offline
const FALLBACK_LOGS: AgentLog[] = [
  { id: "1", timestamp: "--:--:--", agent: "Diagnostician", action: "Waiting for backend connection…", target: "--", status: "waiting" },
  { id: "2", timestamp: "--:--:--", agent: "Remediator",    action: "Standby — no active repairs",    target: "--", status: "waiting" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function AgentActivity() {
  const queryClient = useQueryClient();

  const { data, isLoading, dataUpdatedAt } = useQuery<AgentLog[]>({
    queryKey: ["agent-logs"],
    queryFn: () => api.getAgentLogs(20),
  });

  const logs = data?.length ? data : FALLBACK_LOGS;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : "--:--:--";

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["agent-logs"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["pipeline-status"] });
  };

  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono text-xs">
      <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#cbd5e1] font-semibold">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Autonomous Agent Live Activity Stream</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#64748b] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastUpdated}
          </span>
          <button
            onClick={handleManualRefresh}
            className="text-[10px] text-[#64748b] hover:text-blue-400 transition-colors px-1.5 py-0.5 rounded border border-[#2b2b3d] hover:border-blue-500/40"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "↺ Refresh"}
          </button>
        </div>
      </div>

      <div className="divide-y divide-[#2b2b3d]">
        {logs.map((log) => {
          const sc = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.waiting;
          const time = log.timestamp.length > 8
            ? new Date(log.timestamp).toLocaleTimeString()
            : log.timestamp;

          return (
            <div
              key={log.id}
              className="p-3.5 hover:bg-[#252538] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#64748b] w-16 shrink-0">{time}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#13131d] text-blue-400 border border-[#2b2b3d] text-[10px] whitespace-nowrap">
                  {log.agent}
                </span>
                <span className="text-[#e2e8f0] truncate max-w-xs">{log.action}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-[11px] text-purple-400 truncate max-w-[120px]">{log.target}</span>
                <span className={`text-[10px] flex items-center gap-1 ${sc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
