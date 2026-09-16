"use client";

import { Activity, ShieldAlert, Zap, Radio, Clock, Cpu } from "lucide-react";

export function TelemetryCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 font-mono">
        <div className="flex items-center justify-between text-[#94a3b8] text-xs mb-1">
          <span>Active Pipeline</span>
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        </div>
        <div className="text-xl font-bold text-[#f1f5f9]">Redis Stream</div>
        <span className="text-[10px] text-emerald-400 mt-1 block">healerdb:events (0 lag)</span>
      </div>

      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 font-mono">
        <div className="flex items-center justify-between text-[#94a3b8] text-xs mb-1">
          <span>Simulation Mode</span>
          <Zap className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="text-xl font-bold text-[#f1f5f9]">Testcontainers</div>
        <span className="text-[10px] text-blue-400 mt-1 block">Ephemeral clone verification</span>
      </div>

      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 font-mono">
        <div className="flex items-center justify-between text-[#94a3b8] text-xs mb-1">
          <span>Safety Interlock</span>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-xl font-bold text-amber-400">Dry-Run Active</div>
        <span className="text-[10px] text-[#94a3b8] mt-1 block">Human review mandatory</span>
      </div>

      <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg p-4 font-mono">
        <div className="flex items-center justify-between text-[#94a3b8] text-xs mb-1">
          <span>AI Inference Engine</span>
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-xl font-bold text-[#f1f5f9]">Groq Llama 3.3</div>
        <span className="text-[10px] text-purple-400 mt-1 block">ChromaDB RAG integrated</span>
      </div>
    </div>
  );
}
