"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Proposal } from "@/lib/api";
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Code2,
} from "lucide-react";
import { useState } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Proposal["status"],
  { label: string; color: string }
> = {
  pending:  { label: "Pending Review", color: "text-amber-400" },
  approved: { label: "Approved",       color: "text-blue-400"  },
  rejected: { label: "Rejected",       color: "text-rose-400"  },
  applied:  { label: "Applied",        color: "text-emerald-400" },
};

const RISK_CONFIG: Record<
  Proposal["risk_level"],
  { badge: string }
> = {
  low:    { badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  medium: { badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  high:   { badge: "bg-rose-500/15 text-rose-400 border border-rose-500/30" },
};

// ─── SQL Diff viewer ──────────────────────────────────────────────────────────

function SqlDiff({ sql }: { sql: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = sql.slice(0, 120) + (sql.length > 120 ? "…" : "");

  return (
    <div className="mt-3">
      <pre
        className="text-[10px] bg-[#13131d] border border-[#2b2b3d] rounded p-3 text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? sql : preview}
      </pre>
      {sql.length > 120 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[10px] text-[#64748b] hover:text-blue-400 mt-1 transition-colors"
        >
          {expanded ? "Collapse ▲" : "Expand full patch ▼"}
        </button>
      )}
    </div>
  );
}

// ─── Single proposal card ─────────────────────────────────────────────────────

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const queryClient = useQueryClient();
  const sc = STATUS_CONFIG[proposal.status] ?? STATUS_CONFIG.pending;
  const rc = RISK_CONFIG[proposal.risk_level] ?? RISK_CONFIG.medium;

  const approveMut = useMutation({
    mutationFn: () => api.approveProposal(proposal.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["proposals"] }),
  });

  const rejectMut = useMutation({
    mutationFn: () => api.rejectProposal(proposal.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["proposals"] }),
  });

  const isPending = proposal.status === "pending";

  return (
    <div
      className={`bg-[#1e1e2e] border rounded-lg p-4 font-mono transition-colors ${
        proposal.status === "applied" ? "border-emerald-500/30" :
        proposal.status === "rejected" ? "border-rose-500/20 opacity-60" :
        "border-[#2b2b3d] hover:border-[#3f3f5a]"
      }`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#e2e8f0]">
              {proposal.table_name}
              <span className="text-[#64748b]">.</span>
              <span className="text-blue-400">{proposal.column_name}</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${rc.badge}`}>
              {proposal.risk_level} risk
            </span>
            <span className={`text-[10px] font-semibold ${sc.color}`}>
              {sc.label}
            </span>
          </div>
          <p className="text-[11px] text-purple-400 mt-1">{proposal.strategy}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {proposal.sandbox_passed ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Sandbox OK
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Sandbox Failed
            </span>
          )}
        </div>
      </div>

      {/* SQL diff */}
      <SqlDiff sql={proposal.sql_patch} />

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-[#64748b]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(proposal.created_at).toLocaleString()}
        </span>

        {isPending && (
          <div className="flex items-center gap-2">
            <button
              id={`reject-proposal-${proposal.id}`}
              onClick={() => rejectMut.mutate()}
              disabled={rejectMut.isPending}
              className="flex items-center gap-1 px-2.5 py-1 rounded border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
            >
              {rejectMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
              Reject
            </button>
            <button
              id={`approve-proposal-${proposal.id}`}
              onClick={() => approveMut.mutate()}
              disabled={approveMut.isPending || !proposal.sandbox_passed}
              className="flex items-center gap-1 px-2.5 py-1 rounded border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
            >
              {approveMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Approve &amp; Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProposalList() {
  const { data, isLoading, isError, error } = useQuery<Proposal[]>({
    queryKey: ["proposals"],
    queryFn: api.getProposals,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#1e1e2e] border border-rose-500/30 rounded-lg p-6 font-mono text-xs text-rose-400">
        <p className="font-semibold">Failed to load proposals</p>
        <p className="text-[#64748b] mt-1">{(error as Error)?.message ?? "Unknown error"}</p>
      </div>
    );
  }

  const proposals = data ?? [];

  if (proposals.length === 0) {
    return (
      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-8 font-mono text-center text-xs text-[#64748b] flex flex-col items-center gap-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
        <span>No remediation proposals yet. Run the diagnostician to generate repair plans.</span>
      </div>
    );
  }

  const pending   = proposals.filter((p) => p.status === "pending");
  const rest      = proposals.filter((p) => p.status !== "pending");

  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">
          {pending.length} pending approval
        </p>
      )}
      {[...pending, ...rest].map((p) => (
        <ProposalCard key={p.id} proposal={p} />
      ))}
    </div>
  );
}
