import type { Metadata } from "next";
import "./globals.css";
import { ActivityBar } from "@/components/layout/activity-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { EditorTabs } from "@/components/layout/editor-tabs";
import { StatusBar } from "@/components/layout/status-bar";

export const metadata: Metadata = {
  title: "HealerDB — Autonomous Database Health Studio",
  description: "VS Code-themed autonomous self-healing database monitoring and repair console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen w-screen flex flex-col bg-[#13131d] text-[#e2e8f0] antialiased overflow-hidden">
        {/* Main Work Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* VS Code Left Activity Bar */}
          <ActivityBar />

          {/* VS Code Primary Sidebar Drawer */}
          <Sidebar />

          {/* Main Editor & Content Pane */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#13131d] overflow-hidden">
            <EditorTabs />
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </main>
        </div>

        {/* VS Code Bottom Status Bar */}
        <StatusBar />
      </body>
    </html>
  );
}
