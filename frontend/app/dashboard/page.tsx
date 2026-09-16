"use client";

import { StatGrid } from "@/components/dashboard/stat-grid";
import { PipelineStream } from "@/components/dashboard/pipeline-stream";
import { AgentActivity } from "@/components/dashboard/agent-activity";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Invalidate all dashboard queries so children refetch live data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["pipeline-status"] }),
      queryClient.invalidateQueries({ queryKey: ["agent-logs"] }),
    ]);
    // Brief visual feedback so the user can see the action took effect
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between border-b border-[#2b2b3d] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-[#f1f5f9] font-mono tracking-tight">
              System Health &amp; Telemetry
            </h1>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1 font-mono">
            Autonomous self-healing engine telemetry, real-time pipeline status, and active agent execution.
          </p>
        </div>

        <button
          id="dashboard-refresh-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#28283d] border border-[#2b2b3d] text-[#cbd5e1] rounded text-xs font-mono transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
          <span>{isRefreshing ? "Refreshing…" : "Refresh Metrics"}</span>
        </button>
      </div>

      {/* KPI Stats Grid — live data via useQuery */}
      <StatGrid />

      {/* 5-Stage Pipeline — status-driven rendering */}
      <PipelineStream />

      {/* Real-time Agent Activity — live log stream */}
      <AgentActivity />
    </div>
  );
}
