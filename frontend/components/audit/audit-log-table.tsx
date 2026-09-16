"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type AuditEntry } from "@/lib/api";
import { ShieldCheck, RotateCcw, CheckCircle2, User2 } from "lucide-react";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AuditSkeleton() {
  return (
    <div className="divide-y divide-[#2b2b3d] animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-3 flex items-center gap-4">
          <div className="h-3 w-24 bg-[#2b2b3d] rounded" />
          <div className="h-3 w-36 bg-[#2b2b3d] rounded" />
          <div className="h-3 w-28 bg-[#2b2b3d] rounded" />
          <div className="h-3 w-16 bg-[#2b2b3d] rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AuditLogTable() {
  const { data, isLoading, isError, error } = useQuery<AuditEntry[]>({
    queryKey: ["audit-log"],
    queryFn: api.getAuditLog,
    refetchInterval: 30_000, // audit log refreshes every 30 s
  });

  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono">
      {/* Header */}
      <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#cbd5e1] text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Immutable Audit Trail</span>
          {data && (
            <span className="text-[#64748b] font-normal">({data.length} records)</span>
          )}
        </div>
        <span className="text-[10px] text-[#64748b]">Refreshes every 30 s</span>
      </div>

      {/* Content */}
      {isLoading ? (
        <AuditSkeleton />
      ) : isError ? (
        <div className="p-6 text-xs text-rose-400">
          <p className="font-semibold">Failed to load audit log</p>
          <p className="text-[#64748b] mt-1">{(error as Error)?.message ?? "Unknown error"}</p>
        </div>
      ) : !data?.length ? (
        <div className="p-8 text-center text-xs text-[#64748b] flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
          <span>No audit records yet. Applied repairs will appear here.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#2b2b3d] text-[#64748b] text-[10px] uppercase tracking-wider">
                <th className="px-3 py-2 text-left">Applied At</th>
                <th className="px-3 py-2 text-left">Table · Column</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-right">Rows Affected</th>
                <th className="px-3 py-2 text-left">Applied By</th>
                <th className="px-3 py-2 text-left">Rollback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2b3d]">
              {data.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-[#252538] transition-colors"
                >
                  <td className="px-3 py-2 text-[#64748b]">
                    {new Date(entry.applied_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-[#e2e8f0]">
                    {entry.table_name}
                    <span className="text-[#64748b]">.</span>
                    <span className="text-blue-400">{entry.column_name}</span>
                  </td>
                  <td className="px-3 py-2 text-purple-400">{entry.action}</td>
                  <td className="px-3 py-2 text-right text-emerald-400 font-semibold">
                    {entry.rows_affected.toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1 text-[#94a3b8]">
                      <User2 className="w-3 h-3" />
                      {entry.applied_by}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {entry.rollback_available ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <RotateCcw className="w-3 h-3" />
                        Available
                      </span>
                    ) : (
                      <span className="text-[#64748b]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
