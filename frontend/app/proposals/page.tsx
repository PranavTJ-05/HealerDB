"use client";

import { Wrench } from "lucide-react";
import { ProposalList } from "@/components/proposals/proposal-list";

export default function ProposalsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#2b2b3d] pb-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg font-semibold text-[#f1f5f9] font-mono tracking-tight">
            Remediation Proposals
          </h1>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1 font-mono">
          AI-generated SQL repair patches, sandbox-validated and ready for admin review.
          Approve to apply atomically with full rollback support.
        </p>
      </div>

      {/* Proposal cards with SQL diff viewer */}
      <ProposalList />
    </div>
  );
}
