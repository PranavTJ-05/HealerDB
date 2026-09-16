"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type Anomaly } from "@/lib/api";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Loader2 } from "lucide-react";

// ─── Severity config ──────────────────────────────────────────────────────────

const SEV: Record<
  Anomaly["severity"],
  { icon: React.ReactNode; badge: string; row: string }
> = {
  critical: {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
    badge: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    row: "hover:bg-rose-500/5",
  },
  warning: {
    icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
    badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    row: "hover:bg-amber-500/5",
  },
  info: {
    icon: <Info className="w-3.5 h-3.5 text-blue-400" />,
    badge: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    row: "hover:bg-blue-500/5",
  },
};

const STATUS_COLOR: Record<Anomaly["status"], string> = {
  open:     "text-rose-400",
  pending:  "text-amber-400",
  resolved: "text-emerald-400",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function AnomalyTable() {
  const { data, isLoading, isError, error } = useQuery<Anomaly[]>({
    queryKey: ["anomalies"],
    queryFn: api.getAnomalies,
  });

  if (isLoading) {
    return (
      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono animate-pulse">
        <div className="h-10 bg-[#181824] border-b border-[#2b2b3d]" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 border-b border-[#2b2b3d] px-4 flex items-center gap-3">
            <div className="h-3 w-16 bg-[#2b2b3d] rounded" />
            <div className="h-3 w-32 bg-[#2b2b3d] rounded" />
            <div className="h-3 w-24 bg-[#2b2b3d] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#1e1e2e] border border-rose-500/30 rounded-lg p-6 font-mono text-xs text-rose-400">
        <p className="font-semibold">Failed to load anomalies</p>
        <p className="text-[#64748b] mt-1">{(error as Error)?.message ?? "Unknown error"}</p>
      </div>
    );
  }

  const anomalies = data ?? [];

  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono">
      <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#cbd5e1] text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Detected Anomalies</span>
          <span className="text-[#64748b] font-normal">({anomalies.length} total)</span>
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#64748b] font-mono flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
          <span>No anomalies detected. All monitored tables are healthy.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#2b2b3d] text-[#64748b] text-[10px] uppercase tracking-wider">
                <th className="px-3 py-2 text-left">Severity</th>
                <th className="px-3 py-2 text-left">Table · Column</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Value</th>
                <th className="px-3 py-2 text-left">Expected Range</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2b3d]">
              {anomalies.map((a) => {
                const sv = SEV[a.severity] ?? SEV.info;
                return (
                  <tr key={a.id} className={`transition-colors ${sv.row}`}>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${sv.badge}`}>
                        {sv.icon}
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[#e2e8f0]">
                      {a.table_name}
                      <span className="text-[#64748b]">.</span>
                      <span className="text-blue-400">{a.column_name}</span>
                    </td>
                    <td className="px-3 py-2 text-purple-400">{a.anomaly_type}</td>
                    <td className="px-3 py-2 text-right text-[#94a3b8]">
                      {a.value !== null ? String(a.value) : "—"}
                    </td>
                    <td className="px-3 py-2 text-[#64748b]">{a.expected_range ?? "—"}</td>
                    <td className={`px-3 py-2 font-semibold ${STATUS_COLOR[a.status]}`}>
                      {a.status}
                    </td>
                    <td className="px-3 py-2 text-[#64748b]">
                      {new Date(a.detected_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
