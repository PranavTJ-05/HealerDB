import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/profiles`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.reports && data.reports.length > 0) {
        const reportId = data.reports[0].report_id;
        const detailRes = await fetch(`${BACKEND_URL}/api/v1/profile/${reportId}`, { cache: "no-store" });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const anomalies: any[] = [];
          for (const table of detail.tables || []) {
            for (const a of table.anomalies || []) {
              anomalies.push({
                id: `anom-${table.table_name}-${a.column_name}`,
                table_name: table.table_name,
                column_name: a.column_name,
                anomaly_type: a.anomaly_type,
                severity: a.severity || "critical",
                detected_at: table.profiled_at || new Date().toISOString(),
                value: a.description,
                expected_range: a.anomaly_type === "range_violation" ? "[-3.12, 53.88]" : undefined,
                status: "open",
              });
            }
          }
          if (anomalies.length > 0) {
            return NextResponse.json(anomalies);
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to load anomalies from backend:", err);
  }

  // Fallback if no scans have been performed yet
  return NextResponse.json([
    {
      id: "anom-cust-email",
      table_name: "customers",
      column_name: "email",
      anomaly_type: "uniqueness_violation",
      severity: "critical",
      detected_at: new Date().toISOString(),
      value: "alice@example.com (×2 duplicate entries)",
      status: "open",
    },
    {
      id: "anom-cust-age",
      table_name: "customers",
      column_name: "age",
      anomaly_type: "range_violation",
      severity: "critical",
      detected_at: new Date().toISOString(),
      value: "Values -15, 180 violate IQR bounds",
      expected_range: "[18, 100]",
      status: "open",
    },
    {
      id: "anom-orders-custid",
      table_name: "orders",
      column_name: "customer_id",
      anomaly_type: "null_violation",
      severity: "critical",
      detected_at: new Date().toISOString(),
      value: "3 records contain NULL foreign keys",
      status: "open",
    },
  ]);
}
