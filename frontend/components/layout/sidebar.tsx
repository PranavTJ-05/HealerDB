"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FolderTree, 
  ChevronDown, 
  ChevronRight, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  Terminal,
  Activity,
  Layers
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState({
    explorer: true,
    telemetry: true,
    diagnostics: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="w-64 shrink-0 bg-[#1e1e2e] border-r border-[#2b2b3d] flex flex-col select-none text-xs text-[#94a3b8]">
      {/* Workspace Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#2b2b3d] text-[11px] uppercase tracking-wider font-semibold text-[#64748b]">
        <span>Explorer: HealerDB</span>
        <span className="flex items-center gap-1.5 text-blue-400 font-mono text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          ONLINE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Section: Active Target Database */}
        <div className="mb-2">
          <button 
            onClick={() => toggleSection("explorer")}
            className="w-full flex items-center gap-1.5 px-3 py-1 hover:bg-[#28283d] text-[#cbd5e1] font-semibold text-[11px]"
          >
            {openSections.explorer ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span className="uppercase">Target Database</span>
          </button>
          
          {openSections.explorer && (
            <div className="pl-6 pr-2 py-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[#28283d] text-emerald-400 cursor-pointer">
                <Database className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">healerdb_postgres:5433</span>
              </div>
              <div className="pl-4 text-[10px] text-[#64748b] flex flex-col gap-0.5">
                <span>↳ public.customers (6 rows)</span>
                <span>↳ public.orders (6 rows)</span>
              </div>
            </div>
          )}
        </div>

        {/* Section: Stream Pipeline */}
        <div className="mb-2">
          <button 
            onClick={() => toggleSection("telemetry")}
            className="w-full flex items-center gap-1.5 px-3 py-1 hover:bg-[#28283d] text-[#cbd5e1] font-semibold text-[11px]"
          >
            {openSections.telemetry ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span className="uppercase">Event Bus & Stream</span>
          </button>
          
          {openSections.telemetry && (
            <div className="pl-6 pr-2 py-1 flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between py-0.5 px-2 rounded hover:bg-[#28283d]">
                <span className="font-mono text-[#cbd5e1]">healerdb:events</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between py-0.5 px-2 rounded hover:bg-[#28283d]">
                <span className="font-mono text-[#cbd5e1]">healerdb:repair</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between py-0.5 px-2 rounded hover:bg-[#28283d]">
                <span className="font-mono text-[#cbd5e1]">healerdb:apply</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
          )}
        </div>

        {/* Section: Agent Workflows */}
        <div>
          <button 
            onClick={() => toggleSection("diagnostics")}
            className="w-full flex items-center gap-1.5 px-3 py-1 hover:bg-[#28283d] text-[#cbd5e1] font-semibold text-[11px]"
          >
            {openSections.diagnostics ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span className="uppercase">Active Agents</span>
          </button>
          
          {openSections.diagnostics && (
            <div className="pl-6 pr-2 py-1 flex flex-col gap-1 text-[11px]">
              <div className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-[#28283d]">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Diagnostician (Groq)</span>
              </div>
              <div className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-[#28283d]">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Remediator (Sandbox)</span>
              </div>
              <div className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-[#28283d]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Executor (Atomic Tx)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
