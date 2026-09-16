"use client";

import { useState } from "react";
import { Table, Columns, Key, ShieldCheck, AlertCircle, ChevronDown, ChevronRight, Hash } from "lucide-react";

interface ColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  hasUniqueConstraint: boolean;
  anomaliesDetected: number;
}

interface TableMeta {
  name: string;
  schema: string;
  rowCount: number;
  columns: ColumnMeta[];
}

const mockTables: TableMeta[] = [
  {
    name: "customers",
    schema: "public",
    rowCount: 6,
    columns: [
      { name: "id", type: "integer", nullable: false, isPrimary: true, hasUniqueConstraint: true, anomaliesDetected: 0 },
      { name: "name", type: "varchar(100)", nullable: false, isPrimary: false, hasUniqueConstraint: false, anomaliesDetected: 0 },
      { name: "email", type: "varchar(255)", nullable: false, isPrimary: false, hasUniqueConstraint: false, anomaliesDetected: 1 },
      { name: "age", type: "integer", nullable: true, isPrimary: false, hasUniqueConstraint: false, anomaliesDetected: 1 },
    ]
  },
  {
    name: "orders",
    schema: "public",
    rowCount: 6,
    columns: [
      { name: "id", type: "integer", nullable: false, isPrimary: true, hasUniqueConstraint: true, anomaliesDetected: 0 },
      { name: "customer_id", type: "integer", nullable: false, isPrimary: false, hasUniqueConstraint: false, anomaliesDetected: 2 },
      { name: "amount", type: "numeric(10,2)", nullable: false, isPrimary: false, hasUniqueConstraint: false, anomaliesDetected: 2 },
      { name: "order_date", type: "timestamp", nullable: false, isPrimary: false, hasUniqueConstraint: false, anomaliesDetected: 0 },
      { name: "status", type: "varchar(50)", nullable: true, isPrimary: false, hasUniqueConstraint: false, anomaliesDetected: 0 },
    ]
  }
];

export function SchemaViewer() {
  const [expandedTable, setExpandedTable] = useState<string>("customers");

  return (
    <div className="bg-[#1e1e2e] border border-[#2b2b3d] rounded-lg overflow-hidden font-mono text-xs">
      <div className="h-10 px-4 bg-[#181824] border-b border-[#2b2b3d] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#cbd5e1] font-semibold">
          <Table className="w-4 h-4 text-blue-400" />
          <span>Active Schema Inspection (healerdb.public)</span>
        </div>
        <span className="text-[10px] text-[#64748b]">2 tables monitored</span>
      </div>

      <div className="divide-y divide-[#2b2b3d]">
        {mockTables.map((table) => (
          <div key={table.name}>
            <button
              onClick={() => setExpandedTable(expandedTable === table.name ? "" : table.name)}
              className="w-full h-9 px-4 flex items-center justify-between hover:bg-[#252538] transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {expandedTable === table.name ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                )}
                <span className="text-[#e2e8f0] font-semibold">{table.schema}.{table.name}</span>
                <span className="text-[10px] text-[#64748b]">({table.rowCount} rows)</span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                {table.columns.some(c => c.anomaliesDetected > 0) && (
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <AlertCircle className="w-3 h-3" />
                    <span>Anomalies active</span>
                  </span>
                )}
                <span className="text-[#64748b]">{table.columns.length} columns</span>
              </div>
            </button>

            {expandedTable === table.name && (
              <div className="bg-[#13131d] px-6 py-3 border-t border-[#252538]">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="text-[#64748b] border-b border-[#252538] pb-1">
                      <th className="pb-1.5 font-normal">Column</th>
                      <th className="pb-1.5 font-normal">Data Type</th>
                      <th className="pb-1.5 font-normal">Nullable</th>
                      <th className="pb-1.5 font-normal">Keys & Index</th>
                      <th className="pb-1.5 font-normal text-right">Anomaly Flags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e2e]">
                    {table.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-[#181824]">
                        <td className="py-2 text-[#cbd5e1] font-semibold flex items-center gap-1.5">
                          {col.isPrimary ? <Key className="w-3 h-3 text-amber-400" /> : <Columns className="w-3 h-3 text-[#64748b]" />}
                          <span>{col.name}</span>
                        </td>
                        <td className="py-2 text-purple-400">{col.type}</td>
                        <td className="py-2 text-[#94a3b8]">{col.nullable ? "YES" : "NO"}</td>
                        <td className="py-2 text-[#94a3b8]">
                          {col.isPrimary && <span className="text-amber-400 mr-2">PK</span>}
                          {col.hasUniqueConstraint && <span className="text-blue-400">UNIQUE</span>}
                          {!col.isPrimary && !col.hasUniqueConstraint && "-"}
                        </td>
                        <td className="py-2 text-right">
                          {col.anomaliesDetected > 0 ? (
                            <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              {col.anomaliesDetected} anomaly
                            </span>
                          ) : (
                            <span className="text-emerald-400">Clean ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
