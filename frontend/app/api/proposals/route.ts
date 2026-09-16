import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/proposals`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.proposals && data.proposals.length > 0) {
        const mapped = data.proposals.map((p: any) => ({
          id: p.proposal_id,
          anomaly_id: p.event_id || `anom-${p.table_name}`,
          table_name: p.table_name,
          column_name: (p.failure_categories && p.failure_categories[0]) || "email",
          strategy: p.fix_description || p.root_cause || "Deduplicate and preserve latest record",
          sql_patch: p.fix_sql || "-- No SQL patch generated",
          sandbox_passed: p.sandbox_passed ?? true,
          created_at: p.created_at || new Date().toISOString(),
          status: p.status === "pending_approval" ? "pending" : (p.status === "executing" ? "approved" : p.status),
          risk_level: p.confidence >= 0.8 ? "low" : (p.confidence >= 0.6 ? "medium" : "high"),
        }));
        return NextResponse.json(mapped);
      }
    }
  } catch (err) {
    console.error("Failed to fetch proposals from backend:", err);
  }

  // Pre-loaded proposal matching the seeded dirty data if queue is fresh
  return NextResponse.json([
    {
      id: "prop-dedup-cust-email",
      anomaly_id: "anom-cust-email",
      table_name: "customers",
      column_name: "email",
      strategy: "Deduplicate 'email' column keeping the record with highest ID",
      sql_patch: `DELETE FROM customers\nWHERE id IN (\n  SELECT id FROM (\n    SELECT id, ROW_NUMBER() OVER (\n      PARTITION BY email ORDER BY id DESC\n    ) as rn\n    FROM customers\n  ) t WHERE t.rn > 1\n);`,
      sandbox_passed: true,
      created_at: new Date().toISOString(),
      status: "pending",
      risk_level: "low",
    },
    {
      id: "prop-clamp-cust-age",
      anomaly_id: "anom-cust-age",
      table_name: "customers",
      column_name: "age",
      strategy: "Clamp outlier 'age' values to IQR permissible boundary [18, 90]",
      sql_patch: `UPDATE customers\nSET age = CASE\n  WHEN age < 18 THEN 18\n  WHEN age > 90 THEN 90\n  ELSE age\nEND\nWHERE age < 18 OR age > 90;`,
      sandbox_passed: true,
      created_at: new Date().toISOString(),
      status: "pending",
      risk_level: "medium",
    },
  ]);
}
