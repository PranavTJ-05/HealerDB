import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

export async function GET() {
  try {
    const [healthRes, statusRes] = await Promise.allSettled([
      fetch(`${BACKEND_URL}/health`, { cache: "no-store" }),
      fetch(`${BACKEND_URL}/api/v1/status`, { cache: "no-store" }),
    ]);

    const isHealthy = healthRes.status === "fulfilled" && healthRes.value.ok;
    const statusData = statusRes.status === "fulfilled" && statusRes.value.ok
      ? await statusRes.value.json()
      : null;

    return NextResponse.json({
      db: { status: isHealthy ? "connected" : "disconnected" },
      redis: { status: statusData?.pipeline?.["2_event_bus"] === "ok" ? "connected" : "disconnected" },
      dry_run: statusData?.dry_run ?? true,
      model: "llama-3.3-70b-versatile",
      branch: "main",
    });
  } catch {
    return NextResponse.json({
      db: { status: "disconnected" },
      redis: { status: "disconnected" },
      dry_run: true,
      model: "llama-3.3-70b-versatile",
      branch: "main",
    });
  }
}
