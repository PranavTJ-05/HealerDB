"use client";

import { useState } from "react";
import { Database, Plus, CheckCircle2, RefreshCw, Server, Shield, ExternalLink, HardDrive } from "lucide-react";
import { ConnectionModal } from "@/components/connections/connection-modal";
import { SchemaViewer } from "@/components/connections/schema-viewer";
import { TelemetryCard } from "@/components/connections/telemetry-card";

interface DBConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  user: string;
  status: "connected" | "testing" | "disconnected";
  ssl: boolean;
  lastScanned: string;
  tableCount: number;
}

const defaultConnections: DBConnection[] = [
  {
    id: "conn-1",
    name: "HealerDB Local Target (Docker)",
    host: "localhost",
    port: 5433,
    database: "healerdb",
    user: "healerdb_user",
    status: "connected",
    ssl: false,
    lastScanned: "Just now",
    tableCount: 2,
  },
  {
    id: "conn-2",
    name: "Staging Replica (Read-Only)",
    host: "10.0.4.12",
    port: 5432,
    database: "production_read",
    user: "diagnostics_ro",
    status: "connected",
    ssl: true,
    lastScanned: "12m ago",
    tableCount: 48,
  }
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<DBConnection[]>(defaultConnections);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const testConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between border-b border-[#2b2b3d] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-[#f1f5f9] font-mono tracking-tight">Database Connections</h1>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Registered target databases monitored by HealerDB autonomous diagnosis and repair agents.
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Target DB</span>
        </button>
      </div>

      {/* Grid of Connections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((conn) => (
          <div 
            key={conn.id}
            className="bg-[#1e1e2e] border border-[#2b2b3d] hover:border-blue-500/50 rounded-lg p-5 transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#252538] rounded border border-[#33334d]">
                    <Server className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#e2e8f0] group-hover:text-blue-400 transition-colors font-mono">
                      {conn.name}
                    </h3>
                    <p className="text-xs text-[#64748b] font-mono mt-0.5">
                      {conn.user}@{conn.host}:{conn.port}/{conn.database}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2b2b3d] text-xs font-mono">
                <div className="bg-[#181824] p-2 rounded border border-[#252538]">
                  <span className="text-[10px] text-[#64748b] block">Tables</span>
                  <span className="text-[#cbd5e1] font-semibold">{conn.tableCount} tables</span>
                </div>
                <div className="bg-[#181824] p-2 rounded border border-[#252538]">
                  <span className="text-[10px] text-[#64748b] block">Security</span>
                  <span className="text-[#cbd5e1] font-semibold">{conn.ssl ? "SSL TLS" : "Plaintext"}</span>
                </div>
                <div className="bg-[#181824] p-2 rounded border border-[#252538]">
                  <span className="text-[10px] text-[#64748b] block">Last Scan</span>
                  <span className="text-[#cbd5e1] font-semibold">{conn.lastScanned}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#252538] flex items-center justify-between">
              <span className="text-[11px] text-[#64748b] font-mono">Driver: PostgreSQL 16</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => testConnection(conn.id)}
                  disabled={testingId === conn.id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#252538] hover:bg-[#33334d] text-xs font-mono text-[#cbd5e1] transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${testingId === conn.id ? "animate-spin text-blue-400" : ""}`} />
                  <span>{testingId === conn.id ? "Testing..." : "Test Connection"}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry Summary */}
      <TelemetryCard />

      {/* Target Parameters Info Box */}
      <div className="bg-[#181824] border border-[#2b2b3d] rounded-lg p-4 font-mono text-xs text-[#94a3b8] space-y-2">
        <div className="flex items-center gap-2 text-blue-400 font-semibold">
          <Shield className="w-4 h-4" />
          <span>Security & Ephemeral Isolation Guarantee</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#64748b]">
          Credentials registered with HealerDB are stored locally in memory and never logged or exposed. Before running any remedy, agents launch an ephemeral Docker sandbox container with your schema and test row clones to guarantee zero production regressions.
        </p>
      </div>

      {/* Live Schema Inspection */}
      <SchemaViewer />

      {/* Add Connection Modal */}
      <ConnectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(newConn) => setConnections(prev => [...prev, newConn])}
      />
    </div>
  );
}
