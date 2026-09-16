"use client";

import { BarChart3, SearchCode } from "lucide-react";
import { ProfilerTable } from "@/components/profiler/profiler-table";
import { AnomalyTable } from "@/components/profiler/anomaly-table";

export default function ProfilerPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#2b2b3d] pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h1 className="text-lg font-semibold text-[#f1f5f9] font-mono tracking-tight">
            Database Profiler &amp; Anomaly Inspector
          </h1>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1 font-mono">
          Statistical column profiles, null distributions, and AI-detected data quality anomalies.
        </p>
      </div>

      {/* Section: Column Profiler */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <SearchCode className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-[#cbd5e1] font-mono">Column Statistics</h2>
        </div>
        <ProfilerTable />
      </section>

      {/* Section: Anomaly Inspector */}
      <section>
        <div className="flex items-center gap-2 mb-3 mt-2">
          <BarChart3 className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-semibold text-[#cbd5e1] font-mono">Detected Anomalies</h2>
        </div>
        <AnomalyTable />
      </section>
    </div>
  );
}
