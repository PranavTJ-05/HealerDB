"use client";

import { Activity, Clock, ShieldCheck, Terminal, ArrowUpRight } from "lucide-react";

interface AgentLog {
  id: string;
  time: string;
  agent: string;
  action: string;
  target: string;
  status: "success" | "running" | "waiting";
}

const logs: AgentLog[] = [
  { id: "1", time: "16:06:36", agent: "Diagnostician", action: "Diagnosed statistical outlier on amount", target: "orders.amount", status: "success" },
  { id: "2", time: "16:06:36", agent: "Remediator", action: "Sandbox simulation passed assertion tests", target: "customers.email", status: "success" },
  { id: "3", time: "16:06:36", agent: "Profiler", action: "Identified 6 anomalies across 2 tables", target: "healerdb.public", status: "success" },
  { id: "4", time: "16:03:31", agent: "Executor", action: "Dry-run verification completed", target: "healerdb_postgres", status: "success" },
];

export function AgentActivity() {
  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono text-xs">
      <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#cbd5e1] font-semibold">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Autonomous Agent Live Activity Stream</span>
        </div>
        <span className="text-[10px] text-[#64748b]">Auto-refresh: 2s</span>
      </div>

      <div className="divide-y divide-[#2b2b3d]">
        {logs.map((log) => (
          <div key={log.id} className="p-3.5 hover:bg-[#252538] transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#64748b]">{log.time}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#13131d] text-blue-400 border border-[#2b2b3d] text-[10px]">
                {log.agent}
              </span>
              <span className="text-[#e2e8f0]">{log.action}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-purple-400">{log.target}</span>
              <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Done
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
