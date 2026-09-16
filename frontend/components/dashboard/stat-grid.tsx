"use client";

import { ShieldCheck, AlertTriangle, Wrench, CheckCircle, Flame, Clock } from "lucide-react";

export function StatGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#94a3b8] block">Total Monitored Tables</span>
          <span className="text-2xl font-bold text-[#f1f5f9] mt-0.5 block">2</span>
          <span className="text-[10px] text-emerald-400 mt-1 block">customers, orders</span>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#94a3b8] block">Active Anomalies</span>
          <span className="text-2xl font-bold text-rose-400 mt-0.5 block">6</span>
          <span className="text-[10px] text-rose-400 mt-1 block">6 critical, 0 warnings</span>
        </div>
        <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#94a3b8] block">Pending Proposals</span>
          <span className="text-2xl font-bold text-amber-400 mt-0.5 block">2</span>
          <span className="text-[10px] text-amber-400 mt-1 block">Awaiting admin review</span>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
          <Wrench className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#94a3b8] block">Self-Healed Records</span>
          <span className="text-2xl font-bold text-emerald-400 mt-0.5 block">18</span>
          <span className="text-[10px] text-emerald-400 mt-1 block">100% Tx Rollback Safe</span>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
