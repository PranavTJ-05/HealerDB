"use client";

import { StatGrid } from "@/components/dashboard/stat-grid";
import { PipelineStream } from "@/components/dashboard/pipeline-stream";
import { AgentActivity } from "@/components/dashboard/agent-activity";
import { LayoutDashboard, Radio, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between border-b border-[#2b2b3d] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-[#f1f5f9] font-mono tracking-tight">System Health & Telemetry</h1>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1 font-mono">
            Autonomous self-healing engine telemetry, real-time pipeline status, and active agent execution.
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#28283d] border border-[#2b2b3d] text-[#cbd5e1] rounded text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <StatGrid />

      {/* 5-Stage Pipeline */}
      <PipelineStream />

      {/* Real-time Agent Activity */}
      <AgentActivity />
    </div>
  );
}
