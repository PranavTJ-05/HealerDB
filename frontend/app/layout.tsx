import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { StudioLayout } from "@/components/layout/studio-layout";

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
      <body className="min-h-screen w-screen bg-[#0c0c14] text-[#e2e8f0] antialiased">
        <QueryProvider>
          <StudioLayout>{children}</StudioLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
