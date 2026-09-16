"use client";

import { GitBranch, Wifi, ShieldCheck, Database, Radio, Sparkles } from "lucide-react";

export function StatusBar() {
  return (
    <footer className="h-6 bg-[#0f0f17] border-t border-[#2b2b3d] px-3 flex items-center justify-between text-[11px] text-[#94a3b8] font-mono select-none z-30 shrink-0">
      {/* Left items */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-[#e2e8f0] cursor-pointer">
          <GitBranch className="w-3 h-3 text-blue-400" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Database className="w-3 h-3" />
          <span>healerdb@localhost:5433</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-400">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Stream: OK</span>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-amber-400">
          <ShieldCheck className="w-3 h-3" />
          <span>DRY-RUN: ACTIVE</span>
        </div>
        <div className="flex items-center gap-1 text-purple-400">
          <Sparkles className="w-3 h-3" />
          <span>Groq Llama 3.3</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>UTF-8</span>
        </div>
      </div>
    </footer>
  );
}
