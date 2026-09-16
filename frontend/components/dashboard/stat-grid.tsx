"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type DashboardStats } from "@/lib/api";
import { ShieldCheck, AlertTriangle, Wrench, CheckCircle, Loader2 } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}

function StatCard({ label, value, sub, icon, iconBg, valueColor = "text-[#f1f5f9]" }: StatCardProps) {
  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 flex items-center justify-between hover:border-[#3f3f5a] transition-colors">
      <div>
        <span className="text-[11px] text-[#94a3b8] block">{label}</span>
        <span className={`text-2xl font-bold mt-0.5 block font-mono ${valueColor}`}>{value}</span>
        <span className={`text-[10px] mt-1 block ${valueColor === "text-[#f1f5f9]" ? "text-emerald-400" : valueColor}`}>
          {sub}
        </span>
      </div>
      <div className={`p-3 rounded-lg border ${iconBg}`}>{icon}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 animate-pulse">
      <div className="h-3 w-28 bg-[#2b2b3d] rounded mb-3" />
      <div className="h-8 w-16 bg-[#2b2b3d] rounded mb-2" />
      <div className="h-2.5 w-24 bg-[#2b2b3d] rounded" />
    </div>
  );
}

export function StatGrid() {
  const { data, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  // Fallback values when backend is not yet reachable
  const stats = data ?? {
    monitored_tables: 2,
    table_names: ["customers", "orders"],
    active_anomalies: 0,
    critical_anomalies: 0,
    warning_anomalies: 0,
    pending_proposals: 0,
    self_healed_records: 0,
  };

  const tablesSub = isError
    ? "Backend offline"
    : stats.table_names.slice(0, 2).join(", ");

  const anomalySub = isError
    ? "--"
    : `${stats.critical_anomalies} critical, ${stats.warning_anomalies} warnings`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
      <StatCard
        label="Total Monitored Tables"
        value={stats.monitored_tables}
        sub={tablesSub}
        valueColor="text-[#f1f5f9]"
        iconBg="bg-blue-500/10 border-blue-500/20"
        icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
      />
      <StatCard
        label="Active Anomalies"
        value={stats.active_anomalies}
        sub={anomalySub}
        valueColor="text-rose-400"
        iconBg="bg-rose-500/10 border-rose-500/20"
        icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
      />
      <StatCard
        label="Pending Proposals"
        value={stats.pending_proposals}
        sub="Awaiting admin review"
        valueColor="text-amber-400"
        iconBg="bg-amber-500/10 border-amber-500/20"
        icon={<Wrench className="w-5 h-5 text-amber-400" />}
      />
      <StatCard
        label="Self-Healed Records"
        value={stats.self_healed_records}
        sub="100% Tx Rollback Safe"
        valueColor="text-emerald-400"
        iconBg="bg-emerald-500/10 border-emerald-500/20"
        icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
      />
    </div>
  );
}
