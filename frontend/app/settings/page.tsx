"use client";

import { Settings, Database, Cpu, Zap, Shield, Radio, Info } from "lucide-react";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono">
      <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center gap-2 text-[#cbd5e1] text-xs font-semibold">
        {icon}
        <span>{title}</span>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

// ─── Setting row ──────────────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <p className="text-[12px] text-[#e2e8f0] font-semibold">{label}</p>
        {description && (
          <p className="text-[10px] text-[#64748b] mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative w-9 h-5 rounded-full transition-colors cursor-not-allowed ${
          checked ? "bg-blue-600" : "bg-[#2b2b3d]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span className={`text-[11px] ${checked ? "text-blue-400" : "text-[#64748b]"}`}>{label}</span>
    </div>
  );
}

// ─── Read-only value ──────────────────────────────────────────────────────────

function ReadOnly({ value }: { value: string }) {
  return (
    <span className="px-2.5 py-1 bg-[#13131d] border border-[#2b2b3d] rounded text-[11px] text-purple-400">
      {value}
    </span>
  );
}

// ─── Info badge ───────────────────────────────────────────────────────────────

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`}>
      {children}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#2b2b3d] pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#94a3b8]" />
          <h1 className="text-lg font-semibold text-[#f1f5f9] font-mono tracking-tight">
            Studio Settings
          </h1>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1 font-mono">
          Runtime configuration for the self-healing engine, LLM provider, and execution policy.
          Settings sourced from <code className="text-blue-400">.env</code> — edit environment variables to change.
        </p>
      </div>

      {/* Note */}
      <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-[11px] text-[#94a3b8] font-mono">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <span>
          These settings are read-only in the UI — they reflect the current server environment.
          To change them, update your <code className="text-blue-400">.env</code> file and restart the backend.
        </span>
      </div>

      {/* Target Database */}
      <Section title="Target Database" icon={<Database className="w-4 h-4 text-emerald-400" />}>
        <SettingRow label="Host" description="Postgres host for the monitored database">
          <ReadOnly value="localhost" />
        </SettingRow>
        <SettingRow label="Port" description="Postgres port">
          <ReadOnly value="5433" />
        </SettingRow>
        <SettingRow label="Database Name" description="Target database to monitor and heal">
          <ReadOnly value="healerdb_postgres" />
        </SettingRow>
        <SettingRow label="Connection Status">
          <Badge color="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Connected</Badge>
        </SettingRow>
      </Section>

      {/* Redis Streams */}
      <Section title="Event Bus (Redis Streams)" icon={<Radio className="w-4 h-4 text-blue-400" />}>
        <SettingRow label="Host" description="Redis instance used for the event bus">
          <ReadOnly value="localhost:6379" />
        </SettingRow>
        <SettingRow label="Streams">
          <div className="flex flex-col gap-1 items-end">
            <ReadOnly value="healerdb:events" />
            <ReadOnly value="healerdb:repair" />
            <ReadOnly value="healerdb:apply" />
          </div>
        </SettingRow>
      </Section>

      {/* LLM / AI */}
      <Section title="LLM Inference Provider" icon={<Cpu className="w-4 h-4 text-purple-400" />}>
        <SettingRow label="Provider" description="AI inference backend for root-cause diagnosis">
          <ReadOnly value="Groq Cloud" />
        </SettingRow>
        <SettingRow label="Model" description="Language model used for SQL diagnosis">
          <ReadOnly value="llama-3.3-70b-versatile" />
        </SettingRow>
        <SettingRow label="Temperature">
          <ReadOnly value="0.1" />
        </SettingRow>
      </Section>

      {/* Execution Policy */}
      <Section title="Execution Policy" icon={<Shield className="w-4 h-4 text-amber-400" />}>
        <SettingRow
          label="Dry-Run Mode"
          description="When active, all repairs are validated in sandbox only — no changes are applied to production."
        >
          <Toggle checked={true} label="ACTIVE" />
        </SettingRow>
        <SettingRow
          label="Sandbox Engine"
          description="Ephemeral Postgres container used to validate SQL patches before apply"
        >
          <ReadOnly value="Testcontainers" />
        </SettingRow>
        <SettingRow
          label="Rollback Support"
          description="All applied patches wrap in a transaction with automatic rollback on assertion failure"
        >
          <Toggle checked={true} label="ENABLED" />
        </SettingRow>
      </Section>

      {/* Monitoring */}
      <Section title="Profiler &amp; Scan Policy" icon={<Zap className="w-4 h-4 text-rose-400" />}>
        <SettingRow label="Scan Tables" description="Tables included in statistical profiling">
          <div className="flex gap-2">
            <Badge color="bg-blue-500/15 text-blue-400 border-blue-500/30">customers</Badge>
            <Badge color="bg-blue-500/15 text-blue-400 border-blue-500/30">orders</Badge>
          </div>
        </SettingRow>
        <SettingRow label="Anomaly Threshold" description="Z-score threshold for statistical outlier detection">
          <ReadOnly value="3.0σ" />
        </SettingRow>
        <SettingRow label="Auto-Profiling" description="Trigger profiling automatically on each pipeline run">
          <Toggle checked={true} label="ENABLED" />
        </SettingRow>
      </Section>
    </div>
  );
}
