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
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard",   label: "Explorer & Dashboard",   icon: LayoutDashboard },
  { href: "/proposals",   label: "Self-Healing Proposals", icon: Wrench          },
  { href: "/profiler",    label: "Database Profiler",      icon: BarChart3       },
  { href: "/connections", label: "Target Connections",     icon: Database        },
  { href: "/audit",       label: "Audit & Execution Log",  icon: ScrollText      },
];

export function ActivityBar() {
  const pathname = usePathname();

  return (
    <aside className="w-12 shrink-0 bg-[#181824] border-r border-[#2b2b3d] flex flex-col items-center justify-between py-3 select-none z-30">
      <div className="flex flex-col items-center gap-4 w-full">
        <Link href="/dashboard" className="p-2 text-blue-400 hover:text-blue-300 transition-colors" title="HealerDB Studio">
          <Flame className="w-6 h-6 fill-blue-500/20" />
        </Link>
        <div className="w-6 h-[1px] bg-[#2b2b3d]" />
        <nav className="flex flex-col gap-1 w-full items-center">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "relative w-10 h-10 flex items-center justify-center rounded-md transition-all group",
                  active 
                    ? "text-blue-400 bg-blue-500/10" 
                    : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e1e2e]"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-blue-500 rounded-r" />
                )}
                <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings gear — pinned to bottom */}
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/settings"
          title="Studio Settings"
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-md transition-colors",
            pathname.startsWith("/settings")
              ? "text-blue-400 bg-blue-500/10"
              : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e1e2e]"
          )}
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}
