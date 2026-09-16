"use client";

import { usePathname } from "next/navigation";
import { ActivityBar } from "./activity-bar";
import { Sidebar } from "./sidebar";
import { EditorTabs } from "./editor-tabs";
import { StatusBar } from "./status-bar";

export function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full overflow-y-auto bg-[#0c0c14] text-[#e2e8f0]">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#13131d] text-[#e2e8f0] overflow-hidden select-none">
      {/* Main Work Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* VS Code Left Activity Bar */}
        <ActivityBar />

        {/* VS Code Primary Sidebar Drawer */}
        <Sidebar />

        {/* Main Editor & Content Pane */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#13131d] overflow-hidden select-text">
          <EditorTabs />
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* VS Code Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}
