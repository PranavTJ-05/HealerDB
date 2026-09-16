"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wrench, 
  BarChart3, 
  Database, 
  ScrollText,
  Settings,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard",   label: "Dashboard.sql",       icon: LayoutDashboard },
  { href: "/proposals",   label: "Remediations.diff",   icon: Wrench          },
  { href: "/profiler",    label: "Profiler_Scan.json",  icon: BarChart3       },
  { href: "/connections", label: "Connections.conf",    icon: Database        },
  { href: "/audit",       label: "Audit_Log.out",       icon: ScrollText      },
  { href: "/settings",    label: "settings.json",       icon: Settings        },
];

export function EditorTabs() {
  const pathname = usePathname();

  return (
    <div className="h-9 bg-[#181824] border-b border-[#2b2b3d] flex items-center overflow-x-auto select-none">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "h-full px-3.5 flex items-center gap-2 border-r border-[#2b2b3d] text-xs font-mono transition-colors group relative shrink-0",
              active 
                ? "bg-[#13131d] text-[#e2e8f0] font-medium" 
                : "bg-[#181824] text-[#94a3b8] hover:bg-[#1e1e2e] hover:text-[#cbd5e1]"
            )}
          >
            {active && (
              <span className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
            )}
            <Icon className="w-3.5 h-3.5 text-blue-400" />
            <span>{label}</span>
            <span className="ml-1.5 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#2b2b3d] rounded text-[#64748b]">
              <X className="w-3 h-3" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
