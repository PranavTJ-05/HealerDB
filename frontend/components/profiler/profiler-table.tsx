"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type TableProfile } from "@/lib/api";
import { Database, BarChart3, Hash, Percent, Minus } from "lucide-react";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-[#2b2b3d]">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-3 py-2">
          <div className="h-3 bg-[#2b2b3d] rounded" />
        </td>
      ))}
    </tr>
  );
}

// ─── Null % bar ───────────────────────────────────────────────────────────────

function NullBar({ pct }: { pct: number }) {
  const color = pct > 20 ? "bg-rose-500" : pct > 5 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[#2b2b3d] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={pct > 20 ? "text-rose-400" : pct > 5 ? "text-amber-400" : "text-emerald-400"}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

// ─── Single table panel ───────────────────────────────────────────────────────

function TablePanel({ profile }: { profile: TableProfile }) {
  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono mb-6">
      {/* Header */}
      <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#cbd5e1] text-xs font-semibold">
          <Database className="w-4 h-4 text-blue-400" />
          <span>public.{profile.table_name}</span>
          <span className="text-[#64748b] font-normal">
            — {profile.row_count.toLocaleString()} rows · {profile.column_count} columns
          </span>
        </div>
        <span className="text-[10px] text-[#64748b]">
          Profiled {new Date(profile.profiled_at).toLocaleString()}
        </span>
      </div>

      {/* Column table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-[#2b2b3d] text-[#64748b] text-[10px] uppercase tracking-wider">
              <th className="px-3 py-2 text-left">Column</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-right">Nulls</th>
              <th className="px-3 py-2 text-right">Distinct</th>
              <th className="px-3 py-2 text-right">Min</th>
              <th className="px-3 py-2 text-right">Max</th>
              <th className="px-3 py-2 text-right">Mean / StdDev</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2b3d]">
            {profile.columns.map((col) => (
              <tr key={col.column_name} className="hover:bg-[#252538] transition-colors">
                <td className="px-3 py-2 text-[#e2e8f0] font-semibold">{col.column_name}</td>
                <td className="px-3 py-2 text-purple-400">{col.data_type}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end">
                    <NullBar pct={col.null_pct} />
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-[#94a3b8]">
                  {col.distinct_count.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right text-[#94a3b8]">
                  {col.min !== null ? String(col.min) : <Minus className="w-3 h-3 inline text-[#64748b]" />}
                </td>
                <td className="px-3 py-2 text-right text-[#94a3b8]">
                  {col.max !== null ? String(col.max) : <Minus className="w-3 h-3 inline text-[#64748b]" />}
                </td>
                <td className="px-3 py-2 text-right text-[#94a3b8]">
                  {col.mean !== null ? (
                    <span>
                      {Number(col.mean).toFixed(2)}{" "}
                      <span className="text-[#64748b]">
                        ±{col.stddev !== null ? Number(col.stddev).toFixed(2) : "0"}
                      </span>
                    </span>
                  ) : (
                    <Minus className="w-3 h-3 inline text-[#64748b]" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export function ProfilerTable() {
  const { data, isLoading, isError, error } = useQuery<TableProfile[]>({
    queryKey: ["profiles"],
    queryFn: api.getProfiles,
  });

  if (isLoading) {
    return (
      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono">
        <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center gap-2 text-[#cbd5e1] text-xs font-semibold">
          <BarChart3 className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>Loading column profiles…</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#1e1e2e] border border-rose-500/30 rounded-lg p-6 font-mono text-xs text-rose-400">
        <p className="font-semibold">Failed to load profiling data</p>
        <p className="text-[#64748b] mt-1">{(error as Error)?.message ?? "Unknown error"}</p>
        <p className="text-[#64748b] mt-3">Make sure the backend is running on port 8001.</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-8 font-mono text-center text-xs text-[#64748b]">
        No profiling data found. Run the profiler agent to generate statistics.
      </div>
    );
  }

  return <>{data.map((p) => <TablePanel key={p.table_name} profile={p} />)}</>;
}
