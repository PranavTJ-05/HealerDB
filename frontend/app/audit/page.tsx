"use client";

import { ScrollText } from "lucide-react";
import { AuditLogTable } from "@/components/audit/audit-log-table";

export default function AuditPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#2b2b3d] pb-4">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-emerald-400" />
          <h1 className="text-lg font-semibold text-[#f1f5f9] font-mono tracking-tight">
            Audit &amp; Repair History
          </h1>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1 font-mono">
          Immutable log of all autonomous repairs — timestamped, agent-attributed, and rollback-tagged.
        </p>
      </div>

      {/* Live audit log */}
      <AuditLogTable />
    </div>
  );
}
