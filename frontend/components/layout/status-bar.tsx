"use client";

import { useQuery } from "@tanstack/react-query";
import { GitBranch, ShieldCheck, Database, Radio, Sparkles, AlertTriangle, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HealthStatus {
  db_connected: boolean;
  redis_connected: boolean;
  dry_run_mode: boolean;
  llm_model: string;
  git_branch: string;
  version: string;
}

// ─── Fetcher ─────────────────────────────────────────────────────────────────

async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch("/api/health", { cache: "no-store" });
  if (!res.ok) throw new Error("health check failed");
  return res.json();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StatusBar() {
  const { data, isLoading, isError } = useQuery<HealthStatus>({
    queryKey: ["status-bar-health"],
    queryFn: fetchHealth,
    refetchInterval: 15_000, // re-ping every 15 s
    retry: 1,
  });

  // Resolved display values with sensible fallbacks
  const dbConnected    = data?.db_connected    ?? false;
  const redisOk        = data?.redis_connected ?? false;
  const dryRun         = data?.dry_run_mode    ?? true;
  const model          = data?.llm_model       ?? "Groq Llama 3.3";
  const branch         = data?.git_branch      ?? "main";
  const version        = data?.version         ?? "v1.0.0";

  const streamLabel = isLoading ? "Checking…" : isError ? "Offline" : redisOk ? "Stream: OK" : "Stream: ERR";
  const streamColor = isLoading ? "text-[#64748b]" : isError || !redisOk ? "text-rose-400" : "text-blue-400";

  const dbLabel = isLoading ? "Connecting…" : isError ? "DB: Offline" : dbConnected ? "healerdb@localhost:5433" : "DB: Disconnected";
  const dbColor = dbConnected && !isError ? "text-emerald-400" : "text-rose-400";

  return (
    <footer className="h-6 bg-[#0f0f17] border-t border-[#2b2b3d] px-3 flex items-center justify-between text-[11px] text-[#94a3b8] font-mono select-none z-30 shrink-0">
      {/* Left items */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-[#e2e8f0] cursor-pointer">
          <GitBranch className="w-3 h-3 text-blue-400" />
          <span>{branch}</span>
        </div>

        <div className={`flex items-center gap-1.5 ${dbColor}`}>
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : dbConnected && !isError ? (
            <Database className="w-3 h-3" />
          ) : (
            <AlertTriangle className="w-3 h-3" />
          )}
          <span>{dbLabel}</span>
        </div>

        <div className={`flex items-center gap-1.5 ${streamColor}`}>
          <Radio className="w-3 h-3 animate-pulse" />
          <span>{streamLabel}</span>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-1 ${dryRun ? "text-amber-400" : "text-emerald-400"}`}>
          <ShieldCheck className="w-3 h-3" />
          <span>{dryRun ? "DRY-RUN: ACTIVE" : "LIVE MODE"}</span>
        </div>
        <div className="flex items-center gap-1 text-purple-400">
          <Sparkles className="w-3 h-3" />
          <span>{model}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>{version}</span>
        </div>
      </div>
    </footer>
  );
}
